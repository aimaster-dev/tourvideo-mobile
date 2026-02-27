import AVFoundation
import UIKit
import React

@objc(VideoWatermark)
class VideoWatermark: NSObject {
  
  @objc
  func addWatermark(_ videoPath: String, text: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    let videoURL = URL(fileURLWithPath: videoPath)
    guard FileManager.default.fileExists(atPath: videoPath) else {
      rejecter("FILE_NOT_FOUND", "Video file not found at path: \(videoPath)", nil)
      return
    }
    
    // Load asset asynchronously with proper error handling
    // Use AVURLAsset with options to handle files produced by ffmpeg
    let options: [String: Any] = [AVURLAssetPreferPreciseDurationAndTimingKey: true]
    let asset = AVURLAsset(url: videoURL, options: options)

    // First check if asset is readable
    asset.loadValuesAsynchronously(forKeys: ["tracks", "duration", "isPlayable"]) {
      var error: NSError?
      let tracksStatus = asset.statusOfValue(forKey: "tracks", error: &error)

      if tracksStatus == .failed {
        DispatchQueue.main.async {
          rejecter("LOAD_FAILED", "Cannot decode video — codec may be unsupported by AVFoundation: \(error?.localizedDescription ?? "Unknown error")", error)
        }
        return
      }

      if tracksStatus != .loaded {
        DispatchQueue.main.async {
          rejecter("NOT_LOADED", "Video tracks not loaded (status: \(tracksStatus.rawValue))", nil)
        }
        return
      }

      guard asset.isPlayable else {
        DispatchQueue.main.async {
          rejecter("NOT_PLAYABLE", "Video file is not playable by AVFoundation", nil)
        }
        return
      }
      
      // Check if video has tracks
      guard let videoTrack = asset.tracks(withMediaType: .video).first else {
        DispatchQueue.main.async {
          rejecter("NO_VIDEO_TRACK", "No video track found in file", nil)
        }
        return
      }
      
      // Now process the video
      self.processVideo(asset: asset, videoTrack: videoTrack, text: text, resolver: resolver, rejecter: rejecter)
    }
  }
  
  private func processVideo(asset: AVAsset, videoTrack: AVAssetTrack, text: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    let composition = AVMutableComposition()
    
    guard let compositionVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
      rejecter("TRACK_ERROR", "Failed to create composition video track", nil)
      return
    }
    
    do {
      try compositionVideoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: videoTrack, at: .zero)
      
      // Add audio if exists
      if let audioTrack = asset.tracks(withMediaType: .audio).first,
         let compositionAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
        try compositionAudioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: audioTrack, at: .zero)
      }
      
      let videoComposition = AVMutableVideoComposition()
      videoComposition.renderSize = videoTrack.naturalSize
      videoComposition.frameDuration = CMTime(value: 1, timescale: 30)
      
      let instruction = AVMutableVideoCompositionInstruction()
      instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
      
      let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
      instruction.layerInstructions = [layerInstruction]
      videoComposition.instructions = [instruction]
      
      // Create watermark
      let watermarkLayer = CATextLayer()
      watermarkLayer.string = text
      watermarkLayer.fontSize = 28
      watermarkLayer.foregroundColor = UIColor.white.cgColor
      watermarkLayer.shadowColor = UIColor.black.cgColor
      watermarkLayer.shadowOffset = CGSize(width: 2, height: 2)
      watermarkLayer.shadowOpacity = 1.0
      watermarkLayer.shadowRadius = 3
      watermarkLayer.alignmentMode = .center
      
      let videoSize = videoTrack.naturalSize
      watermarkLayer.frame = CGRect(x: 0, y: videoSize.height / 2 - 20, width: videoSize.width, height: 40)
      
      let parentLayer = CALayer()
      let videoLayer = CALayer()
      parentLayer.frame = CGRect(origin: .zero, size: videoSize)
      videoLayer.frame = CGRect(origin: .zero, size: videoSize)
      parentLayer.addSublayer(videoLayer)
      parentLayer.addSublayer(watermarkLayer)
      
      videoComposition.animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videoLayer, in: parentLayer)
      
      // Export
      let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
      let outputPath = (documentsPath as NSString).appendingPathComponent("watermarked_\(UUID().uuidString).mp4")
      let outputURL = URL(fileURLWithPath: outputPath)
      
      if FileManager.default.fileExists(atPath: outputPath) {
        try FileManager.default.removeItem(at: outputURL)
      }
      
      guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
        rejecter("EXPORT_ERROR", "Failed to create export session", nil)
        return
      }
      
      exporter.outputURL = outputURL
      exporter.outputFileType = .mp4
      exporter.videoComposition = videoComposition
      
      exporter.exportAsynchronously {
        DispatchQueue.main.async {
          switch exporter.status {
          case .completed:
            resolver(outputPath)
          case .failed:
            let errorMsg = exporter.error?.localizedDescription ?? "Unknown error"
            print("Export failed with error: \(errorMsg)")
            rejecter("EXPORT_FAILED", errorMsg, exporter.error)
          case .cancelled:
            rejecter("EXPORT_CANCELLED", "Export was cancelled", nil)
          default:
            rejecter("EXPORT_ERROR", "Unexpected status: \(exporter.status.rawValue)", nil)
          }
        }
      }
      
    } catch {
      rejecter("ERROR", error.localizedDescription, error)
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
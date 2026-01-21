#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoWatermark, NSObject)

RCT_EXTERN_METHOD(addWatermark:(NSString *)videoPath 
                  text:(NSString *)text
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

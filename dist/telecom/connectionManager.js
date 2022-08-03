var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.endVideoCall=endVideoCall;exports.getActiveCall=getActiveCall;exports.getCallByUUID=getCallByUUID;exports.getIncomingCall=getIncomingCall;exports.handleIncomingVideoCallStarted=handleIncomingVideoCallStarted;exports.registerIncomingVideoCall=registerIncomingVideoCall;exports.registerPushKitCall=registerPushKitCall;exports.rejectVideoCall=rejectVideoCall;exports.tryCancelVideoCallNotification=tryCancelVideoCallNotification;var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _reactNativeUuidGenerator=_interopRequireDefault(require("react-native-uuid-generator"));var _reactNative=_interopRequireDefault(require("@notifee/react-native"));var _callkeep=_interopRequireDefault(require("../callkeep"));var _video=_interopRequireDefault(require("../api/video"));var _eventHandlers=require("./eventHandlers");var _reactNative2=require("react-native");var RNHelloDoctorModule=_reactNative2.NativeModules.RNHelloDoctorModule;var calls=[];var getNewCallUUID=function(){var _ref=(0,_asyncToGenerator2.default)(function*(){var callUUID=yield _reactNativeUuidGenerator.default.getRandomUUID();return callUUID.toLowerCase();});return function getNewCallUUID(){return _ref.apply(this,arguments);};}();function getCallByUUID(uuid){return calls.find(function(c){return c.uuid===uuid;});}function getActiveCall(){return calls.find(function(c){return c.status==="in-progress";});}function getIncomingCall(){return calls.find(function(c){return c.status==="incoming";})||getActiveCall();}function registerIncomingVideoCall(_x,_x2,_x3,_x4){return _registerIncomingVideoCall.apply(this,arguments);}function _registerIncomingVideoCall(){_registerIncomingVideoCall=(0,_asyncToGenerator2.default)(function*(uuid,videoRoomSID,consultationID,caller){var call={uuid:uuid||(yield getNewCallUUID()),videoRoomSID:videoRoomSID,consultationID:consultationID,caller:caller,status:"incoming",isCallMuted:false,isCallHeld:false};calls.push(call);_reactNative2.AppRegistry.registerHeadlessTask("RNHelloDoctorIncomingVideoCallService",function(){return new Promise(function(resolve){setTimeout(function(){var incomingCall=getCallByUUID(call.uuid);if(incomingCall.status==="incoming"){tryCancelVideoCallNotification(incomingCall.videoRoomSID).finally(resolve);}},45000);});});return call;});return _registerIncomingVideoCall.apply(this,arguments);}function handleIncomingVideoCallStarted(videoRoomSID){var call=calls.find(function(c){return c.videoRoomSID===videoRoomSID;});if(!call){console.warn("[handleIncomingVideoCallStarted] cannot start "+videoRoomSID+": no call found");return;}call.status="in-progress";}function tryCancelVideoCallNotification(_x5){return _tryCancelVideoCallNotification.apply(this,arguments);}function _tryCancelVideoCallNotification(){_tryCancelVideoCallNotification=(0,_asyncToGenerator2.default)(function*(videoRoomSID){if(_reactNative2.Platform.OS==="android"){yield RNHelloDoctorModule.rejectIncomingCallNotification();}else{var call=calls.find(function(c){return c.videoRoomSID===videoRoomSID;});if(call===undefined){_callkeep.default.endAllCalls();}else{_callkeep.default.endCall(call.uuid);}}});return _tryCancelVideoCallNotification.apply(this,arguments);}function endVideoCall(_x6){return _endVideoCall.apply(this,arguments);}function _endVideoCall(){_endVideoCall=(0,_asyncToGenerator2.default)(function*(videoRoomSID){var call=calls.find(function(c){return c.videoRoomSID===videoRoomSID;});if(!call){console.warn("no call found for room "+videoRoomSID);return;}_callkeep.default.endCall(call.uuid);if(call.status==="completed"){console.info("[endConsultationVideoCall:"+videoRoomSID+"]: call has already been completed");return;}call.status="completed";yield _video.default.endVideoCall(videoRoomSID).catch(function(error){return console.warn("error ending video call "+videoRoomSID,error);});(0,_eventHandlers.navigateOnEndCall)(call.consultationID,videoRoomSID);});return _endVideoCall.apply(this,arguments);}function rejectVideoCall(_x7){return _rejectVideoCall.apply(this,arguments);}function _rejectVideoCall(){_rejectVideoCall=(0,_asyncToGenerator2.default)(function*(videoRoomSID){var call=calls.find(function(c){return c.videoRoomSID===videoRoomSID;});if(!call){console.warn("no call found for room "+videoRoomSID);return;}call.status="completed";yield _video.default.endVideoCall(videoRoomSID);_callkeep.default.rejectCall(call.uuid);});return _rejectVideoCall.apply(this,arguments);}function registerPushKitCall(_x8){return _registerPushKitCall.apply(this,arguments);}function _registerPushKitCall(){_registerPushKitCall=(0,_asyncToGenerator2.default)(function*(notification){var uuid=notification.uuid,videoRoomSID=notification.videoRoomSID,consultationID=notification.consultationID,callerDisplayName=notification.callerDisplayName,callerPhoneNumber=notification.callerPhoneNumber,callerEmail=notification.callerEmail;var existingCall=calls.find(function(c){return c.videoRoomSID===videoRoomSID;});if(existingCall){console.info("already have call existing incoming call, skipping",existingCall);return;}var caller={displayName:callerDisplayName,phoneNumber:callerPhoneNumber,email:callerEmail};yield registerIncomingVideoCall(uuid,videoRoomSID,consultationID,caller);});return _registerPushKitCall.apply(this,arguments);}
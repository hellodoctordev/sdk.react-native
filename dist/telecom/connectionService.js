var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.bootstrap=bootstrap;exports.registerCallEventListeners=registerCallEventListeners;exports.removeCallKeepListeners=removeCallKeepListeners;exports.teardown=teardown;var _reactNative=require("react-native");var _reactNativeVoipPushNotification=_interopRequireDefault(require("react-native-voip-push-notification"));var auth=_interopRequireWildcard(require("../users/auth"));var _eventHandlers=require("./eventHandlers");var _native=require("../ui/video/native");function _getRequireWildcardCache(nodeInterop){if(typeof WeakMap!=="function")return null;var cacheBabelInterop=new WeakMap();var cacheNodeInterop=new WeakMap();return(_getRequireWildcardCache=function _getRequireWildcardCache(nodeInterop){return nodeInterop?cacheNodeInterop:cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj,nodeInterop){if(!nodeInterop&&obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache(nodeInterop);if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(key!=="default"&&Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}var isCallsServiceBootstrapped=false;var RNCallKeepPerformAnswerCallAction='RNCallKeepPerformAnswerCallAction';var RNCallKeepPerformEndCallAction='RNCallKeepPerformEndCallAction';var RNCallKeepDidPerformSetMutedCallAction='RNCallKeepDidPerformSetMutedCallAction';var RNCallKeepDidToggleHoldAction='RNCallKeepDidToggleHoldAction';var RNCallKeepDidLoadWithEvents='RNCallKeepDidLoadWithEvents';var RNCallKeepDidChangeAudioRoute='RNCallKeepDidChangeAudioRoute';function bootstrap(){if(_reactNative.Platform.OS==='android'){return;}if(isCallsServiceBootstrapped){console.info('[bootstrap] not bootstrapping: already bootstrapped');return;}registerCallEventListeners();isCallsServiceBootstrapped=true;}function teardown(){auth.signOut();removeCallKeepListeners();}var hasRegisteredCallEventListeners=false;function handleDidChangeAudioRoute(event){console.debug('[handleDidChangeAudioRoute]',{event:event});}var eventSubscriptions=[];function addEventListener(event,listener){eventSubscriptions.push(_native.hdEventEmitter.addListener(event,listener));}function registerCallEventListeners(){console.debug('[registerCallEventListeners:EMITTER]',{hasRegisteredCallEventListeners:hasRegisteredCallEventListeners});if(hasRegisteredCallEventListeners){return;}addEventListener(RNCallKeepPerformAnswerCallAction,_eventHandlers.CallKeepEventHandlers.handleAnswerCall);addEventListener(RNCallKeepPerformEndCallAction,_eventHandlers.CallKeepEventHandlers.handleEndCall);addEventListener(RNCallKeepDidPerformSetMutedCallAction,_eventHandlers.CallKeepEventHandlers.handleDidPerformSetMutedCallAction);addEventListener(RNCallKeepDidToggleHoldAction,_eventHandlers.CallKeepEventHandlers.handleDidToggleHoldCallAction);addEventListener(RNCallKeepDidLoadWithEvents,_eventHandlers.CallKeepEventHandlers.handleDidLoadWithEvents);addEventListener(RNCallKeepDidChangeAudioRoute,handleDidChangeAudioRoute);addEventListener('incomingPushKitVideoCall',_eventHandlers.PushKitEventHandlers.handleOnNotification);_reactNativeVoipPushNotification.default.addEventListener('didLoadWithEvents',_eventHandlers.PushKitEventHandlers.handleOnDidLoadWithEvents);hasRegisteredCallEventListeners=true;}function removeCallKeepListeners(){console.debug('[removeCallKeepListeners]');eventSubscriptions.map(function(subscription){return subscription.remove();}).forEach(function(index){return eventSubscriptions.pop();});_reactNativeVoipPushNotification.default.removeEventListener('didLoadWithEvents');hasRegisteredCallEventListeners=false;}
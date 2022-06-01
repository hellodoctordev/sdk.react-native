import {Platform} from "react-native";
import VoipPushNotification from "react-native-voip-push-notification";
import RNCallKeep from "../callkeep";
import * as auth from "../users/auth";
import {CallKeepEventHandlers, PushKitEventHandlers, registerVideoCallNavigator} from "./eventHandlers";
import usersServiceApi from "../api/users";

let isCallsServiceBootstrapped = false;

export function bootstrap(navigator) {
    if (Platform.OS === "android") {
        return;
    }

    if (isCallsServiceBootstrapped) {
        console.info("[bootstrap] not bootstrapping: already bootstrapped");
        return;
    }

    registerCallKeepListeners();
    registerVideoCallNavigator(navigator);

    isCallsServiceBootstrapped = true;
}

export function teardown() {
    auth.signOut();

    removeCallKeepListeners();

    if (videoConsultationsSnapshotListener !== null) {
        videoConsultationsSnapshotListener();
        videoConsultationsSnapshotListener = null;
    }

    usersServiceApi.unregisterApnsToken().catch(console.warn);
}

export function checkIsCallKeepConfigured() {
    return Platform.OS === "ios";
}

let videoConsultationsSnapshotListener = null;

let hasRegisteredCallKeepListeners = false;

export function registerCallKeepListeners() {
    if (hasRegisteredCallKeepListeners) {
        return;
    }

    RNCallKeep.addEventListener("answerCall", CallKeepEventHandlers.handleAnswerCall);
    RNCallKeep.addEventListener("didPerformSetMutedCallAction", CallKeepEventHandlers.handleDidPerformSetMutedCallAction);
    RNCallKeep.addEventListener("didToggleHoldCallAction", CallKeepEventHandlers.handleDidToggleHoldCallAction);
    RNCallKeep.addEventListener("endCall", CallKeepEventHandlers.handleEndCall);
    RNCallKeep.addEventListener("didLoadWithEvents", CallKeepEventHandlers.handleDidLoadWithEvents);

    if (Platform.OS === "ios") {
        setupPushKitEvents();
    }

    hasRegisteredCallKeepListeners = true;
}

export function removeCallKeepListeners() {
    RNCallKeep.removeEventListener("answerCall");
    RNCallKeep.removeEventListener("didPerformSetMutedCallAction");
    RNCallKeep.removeEventListener("didToggleHoldCallAction");
    RNCallKeep.removeEventListener("endCall");
    RNCallKeep.removeEventListener("didLoadWithEvents");

    if (Platform.OS === "ios") {
        VoipPushNotification.removeEventListener("register");
        VoipPushNotification.removeEventListener("notification");
        VoipPushNotification.removeEventListener("didLoadWithEvents");
    }

    hasRegisteredCallKeepListeners = false;
}

function setupPushKitEvents() {
    VoipPushNotification.addEventListener("register", PushKitEventHandlers.handleOnRegister);
    VoipPushNotification.addEventListener("notification", PushKitEventHandlers.handleOnNotification);
    VoipPushNotification.addEventListener("didLoadWithEvents", PushKitEventHandlers.handleOnDidLoadWithEvents);

    VoipPushNotification.registerVoipToken();
}

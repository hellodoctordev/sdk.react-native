import {PermissionsAndroid, Platform} from "react-native";
import RNCallKeep from "../callkeep";
import {CallKeepEventHandlers, PushKitEventHandlers} from "./eventHandlers";
import VoipPushNotification from "react-native-voip-push-notification";
import videoApi from "../apis/video";
import * as auth from "../users/auth";

let isCallsServiceBootstrapped = false;

export async function bootstrap(userID, jwt) {
    console.info("[connectionService:bootstrap:START]", {isCallsServiceBootstrapped});
    if (isCallsServiceBootstrapped) {
        console.info("[bootstrap] not bootstrapping: already bootstrapped");
        return;
    }

    auth.signIn(userID, jwt);

    await setupCallKeep().catch(error => console.warn(`error setting up CallKeep: ${error}`));

    registerCallKeepListeners();

    if (Platform.OS === "android") {
        RNCallKeep.setAvailable(true);
    }

    isCallsServiceBootstrapped = true;
}

export async function teardown() {
    auth.signOut();

    removeCallKeepListeners();

    RNCallKeep.endAllCalls();

    if (Platform.OS === "android") {
        RNCallKeep.setAvailable(false);
    }

    if (videoConsultationsSnapshotListener !== null) {
        videoConsultationsSnapshotListener();
        videoConsultationsSnapshotListener = null;
    }

    videoApi.unregisterApnsToken().catch(console.warn);
}

export async function checkIsCallKeepConfigured() {
    if (Platform.OS === "ios") {
        return true;
    }

    const readPhoneNumbersPermission = await PermissionsAndroid.check('android.permission.READ_PHONE_NUMBERS');
    console.debug("[connectionService:checkIsCallKeepConfigured]", {readPhoneNumbersPermission});

    if (!readPhoneNumbersPermission) {
        return false;
    }

    await bootstrap();
    const isConnectionServiceAvailable = await RNCallKeep.isConnectionServiceAvailable();
    const hasPhoneAccount = await RNCallKeep.hasPhoneAccount();
    const hasPhoneAccountEnabled = await RNCallKeep.checkPhoneAccountEnabled();

    console.debug("[connectionService:checkIsCallKeepConfigured]", {isConnectionServiceAvailable, hasPhoneAccountEnabled, hasPhoneAccount});
    return isConnectionServiceAvailable && hasPhoneAccountEnabled;
}

let videoConsultationsSnapshotListener = null;

const callKeepConfig = {
    android: {
        alertTitle: "Permisos para videollamadas",
        alertDescription: "Para una mejor experiencia de videollamadas, agregue Hello Doctor como una cuenta telefónica",
        cancelButton: "Cancel",
        okButton: "ok",
        foregroundService: {
            channelId: "com.hellodoctormx.patient",
            channelName: "Hello Doctor Llamadas",
            notificationTitle: "Hello Doctor Videollamada",
        }
    }
};

export async function setupCallKeep() {
    if (Platform.OS === "ios") {
        return;
    }

    await RNCallKeep.registerPhoneAccount(callKeepConfig);
    await RNCallKeep.registerAndroidEvents();
}

let hasRegisteredCallKeepListeners = false;

export function registerCallKeepListeners() {
    console.info("[connectionService:registerCallKeepListeners]", {hasRegisteredCallKeepListeners});

    if (hasRegisteredCallKeepListeners) {
        return;
    }

    RNCallKeep.addEventListener("answerCall", CallKeepEventHandlers.handleAnswerCall);
    RNCallKeep.addEventListener("didDisplayIncomingCall", CallKeepEventHandlers.handleDidDisplayIncomingCall);
    RNCallKeep.addEventListener("didReceiveStartCallAction", CallKeepEventHandlers.handleDidReceiveStartCallAction);
    RNCallKeep.addEventListener("didPerformSetMutedCallAction", CallKeepEventHandlers.handleDidPerformSetMutedCallAction);
    RNCallKeep.addEventListener("didToggleHoldCallAction", CallKeepEventHandlers.handleDidToggleHoldCallAction);
    RNCallKeep.addEventListener("endCall", CallKeepEventHandlers.handleEndCall);
    RNCallKeep.addEventListener("didLoadWithEvents", CallKeepEventHandlers.handleDidLoadWithEvents);

    if (Platform.OS === "ios") {
        setupPushKitEvents();
    }

    hasRegisteredCallKeepListeners = true;

    console.info("[connectionService:registerCallKeepListeners:DONE]");
}

export function removeCallKeepListeners() {
    RNCallKeep.removeEventListener("answerCall");
    RNCallKeep.removeEventListener("didDisplayIncomingCall");
    RNCallKeep.removeEventListener("didReceiveStartCallAction");
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

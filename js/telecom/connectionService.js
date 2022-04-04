import {PermissionsAndroid, Platform} from "react-native";
import VoipPushNotification from "react-native-voip-push-notification";
import RNCallKeep from "../callkeep";
import * as auth from "../users/auth";
import {CallKeepEventHandlers, PushKitEventHandlers, registerVideoCallNavigator} from "./eventHandlers";
import usersServiceApi from "../api/users";

let isCallsServiceBootstrapped = false;

export async function bootstrap(navigator) {
    console.info("[connectionService:bootstrap:START]", {isCallsServiceBootstrapped});
    if (isCallsServiceBootstrapped) {
        console.info("[bootstrap] not bootstrapping: already bootstrapped");
        return;
    }

    isCallsServiceBootstrapped = true;

    try {
        registerCallKeepListeners();
        registerVideoCallNavigator(navigator);

        await setupCallKeep().catch(error => console.warn(`error setting up CallKeep: ${error}`));

        if (Platform.OS === "android") {
            RNCallKeep.setAvailable(true);
        }
    } catch(error) {
        console.warn("[connectionService.bootstrap] error occurred during bootstrapping", error);
        isCallsServiceBootstrapped = false;

        throw error;
    }

    console.info("[connectionService:bootstrap:DONE]");
}

export async function teardown() {
    console.info("[connectionService:teardown]");

    auth.signOut();

    removeCallKeepListeners();

    if (Platform.OS === "android") {
        RNCallKeep.setAvailable(false);
    }

    if (videoConsultationsSnapshotListener !== null) {
        videoConsultationsSnapshotListener();
        videoConsultationsSnapshotListener = null;
    }

    usersServiceApi.unregisterApnsToken().catch(console.warn);
}

export async function checkIsCallKeepConfigured() {
    return Platform.OS === "ios";
    if (Platform.OS === "ios") {
        return true;
    }

    const readPhoneNumbersPermission = await PermissionsAndroid.check('android.permission.READ_PHONE_NUMBERS');

    if (!readPhoneNumbersPermission) {
        return false;
    }

    await bootstrap();
    const isConnectionServiceAvailable = await RNCallKeep.isConnectionServiceAvailable();
    const hasPhoneAccount = await RNCallKeep.hasPhoneAccount();
    const hasPhoneAccountEnabled = await RNCallKeep.checkPhoneAccountEnabled();

    return isConnectionServiceAvailable && hasPhoneAccountEnabled;
}

let videoConsultationsSnapshotListener = null;

const androidBundleID = "com.delilifetv";

const callKeepConfig = {
    android: {
        alertTitle: "Permisos para videollamadas",
        alertDescription: "Para una mejor experiencia de videollamadas, agregue Hello Doctor como una cuenta telefónica",
        cancelButton: "Cancel",
        okButton: "ok",
        foregroundService: {
            channelId: androidBundleID,
            channelName: "Hello Doctor Llamadas",
            notificationTitle: "Hello Doctor Videollamada",
        }
    }
};

export async function setupCallKeep() {
    return;
    if (Platform.OS !== "android") {
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
    RNCallKeep.addEventListener("didChangeAudioRoute", CallKeepEventHandlers.handleDidChangeAudioRoute);

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
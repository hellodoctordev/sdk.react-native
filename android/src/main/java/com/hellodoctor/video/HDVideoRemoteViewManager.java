package com.hellodoctor.video;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import javax.annotation.Nonnull;

public class HDVideoRemoteViewManager extends SimpleViewManager<HDVideoRemoteView> {
    private static final String REACT_CLASS = "HDVideoRemoteView";

    private ReactApplicationContext mContext;

    HDVideoRemoteViewManager(ReactApplicationContext context) {
        mContext = context;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected HDVideoRemoteView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new HDVideoRemoteView(reactContext);
    }

    @ReactProp(name = "participantSID")
    public void setParticipantSID(HDVideoRemoteView view, String participantSID) {
        HDVideo hdVideo = HDVideo.getInstance(mContext);
        hdVideo.setRemoteParticipantVideoView(view, participantSID);
    }
}
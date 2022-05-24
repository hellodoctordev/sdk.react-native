package com.hellodoctormx.rn.video;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.List;

public class HDVideoPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> nativeModules = new ArrayList<>();
        nativeModules.add(HDVideoModule.getInstance(reactContext));

        return nativeModules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> viewManagers = new ArrayList<>();
        viewManagers.add(new HDVideoLocalViewManager(reactContext));
        viewManagers.add(new HDVideoRemoteViewManager(reactContext));
        viewManagers.add(new HDVideoPortalViewManager(reactContext));

        return viewManagers;
    }
}
package com.machinetoolsmobile;

import android.content.Context;
import com.facebook.react.soloader.OpenSourceMergedSoMapping;
import com.facebook.soloader.SoLoader;
import java.io.IOException;

/**
 * Helper class that initializes SoLoader with the merged SO mapping.
 * This is necessary for React Native 0.76+ where libreact_featureflagsjni.so
 * is merged into libreactnative.so. Using Java allows accessing the
 * Kotlin-internal OpenSourceMergedSoMapping singleton.
 */
public class SoLoaderHelper {
    public static void init(Context context) {
        try {
            SoLoader.init(context, OpenSourceMergedSoMapping.INSTANCE);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize SoLoader with merged SO mapping", e);
        }
    }
}

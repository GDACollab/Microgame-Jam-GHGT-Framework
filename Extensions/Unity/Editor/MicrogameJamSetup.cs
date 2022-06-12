using UnityEngine;
using UnityEditor;

[InitializeOnLoad]
public class MicrogameJamSetup {
    static MicrogameJamSetup() {
        if (!MatchesSettings()) {
            if (EditorUtility.DisplayDialog("Editor Settings Do Not Match", "Unity Editor Settings do not match required settings for Microgame Jam builds. Change to match required settings?", "Change", "Don't Change")){
                ChangeSettings();
            }
        }
    }

    static bool MatchesSettings(){
        bool sizeMatches = PlayerSettings.defaultWebScreenHeight == 540 && PlayerSettings.defaultWebScreenWidth == 960;
        bool templateMatches = PlayerSettings.WebGL.template == "APPLICATION:Minimal";
        bool backgroundMatches = PlayerSettings.runInBackground == true;
        bool buildTargetMatches = EditorUserBuildSettings.activeBuildTarget == BuildTarget.WebGL && EditorUserBuildSettings.GetPlatformSettings(BuildPipeline.GetBuildTargetName(BuildTarget.WebGL), "CodeOptimization") == "size";
        bool compressionMatches = PlayerSettings.WebGL.compressionFormat == WebGLCompressionFormat.Gzip;
        return sizeMatches && templateMatches && buildTargetMatches && compressionMatches && backgroundMatches;
    }

    static void ChangeSettings(){
        EditorUserBuildSettings.SetPlatformSettings(BuildPipeline.GetBuildTargetName(BuildTarget.WebGL), "CodeOptimization", "size");
        EditorUserBuildSettings.SwitchActiveBuildTargetAsync(BuildTargetGroup.WebGL, BuildTarget.WebGL);
        PlayerSettings.defaultWebScreenHeight = 540;
        PlayerSettings.defaultWebScreenWidth = 960;
        PlayerSettings.WebGL.template = "APPLICATION:Minimal";
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
        PlayerSettings.runInBackground = true;
    }
}
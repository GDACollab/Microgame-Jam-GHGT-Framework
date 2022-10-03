using UnityEngine;
using UnityEditor;

[InitializeOnLoad]
public class MicrogameJamSetup
{
    static MicrogameJamSetup() {
        VerifySettings();
    }


    [MenuItem("Microgame Jam/Verify Settings")]
    static void VerifySettingsMenu() {
        if (VerifySettings()) {
            EditorUtility.DisplayDialog("Settings Already Matched", "Your Unity Project Settings already match what's recommended for Microgame Jam builds. Good job!", "OK");
        }
    }

    static bool VerifySettings() {
        if (!MatchesSettings())
        {
            if (EditorUtility.DisplayDialog("Editor Settings Do Not Match", "Unity Editor Settings do not match required settings for Microgame Jam builds. Change to match required settings?", "Change", "Don't Change"))
            {
                ChangeSettings();
            }
            else
            {
                EditorUtility.DisplayDialog("Settings Not Changed", "That's not recommended, but you can always update the settings at any time through the Microgame Jam/Verify Settings button in the topmost menu.", "OK");
            }
            return false;
        }
        else {
            return true;
        }
    }

    static bool MatchesSettings()
    {
        bool sizeMatches = PlayerSettings.defaultWebScreenHeight == 540 && PlayerSettings.defaultWebScreenWidth == 960;
        bool templateMatches = PlayerSettings.WebGL.template == "APPLICATION:Minimal";
        bool backgroundMatches = PlayerSettings.runInBackground == true;
        bool buildTargetMatches = EditorUserBuildSettings.selectedBuildTargetGroup == BuildTargetGroup.WebGL && EditorUserBuildSettings.GetPlatformSettings(BuildPipeline.GetBuildTargetName(BuildTarget.WebGL), "CodeOptimization") == "Size";
        bool compressionMatches = PlayerSettings.WebGL.compressionFormat == WebGLCompressionFormat.Gzip;
        return sizeMatches && templateMatches && buildTargetMatches && compressionMatches && backgroundMatches;
    }

    static void ChangeSettings()
    {
        EditorUserBuildSettings.SetPlatformSettings(BuildPipeline.GetBuildTargetName(BuildTarget.WebGL), "CodeOptimization", "Size");
        EditorUserBuildSettings.SwitchActiveBuildTargetAsync(BuildTargetGroup.WebGL, BuildTarget.WebGL);
        PlayerSettings.defaultWebScreenHeight = 540;
        PlayerSettings.defaultWebScreenWidth = 960;
        PlayerSettings.WebGL.template = "APPLICATION:Minimal";
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
        PlayerSettings.runInBackground = true;
        EditorUtility.DisplayDialog("Project Settings Updated", "Unity Project Settings updated to match recommended settings.", "OK");
    }
}
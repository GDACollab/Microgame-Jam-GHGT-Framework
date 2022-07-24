using UnityEngine;
using System.Runtime.InteropServices;
using UnityEngine.SceneManagement;

public class MicrogameJamController : MonoBehaviour {

    [Range(1, 3)]
    public int defaultDifficulty;

    [DllImport("__Internal")]
    private static extern void Win();

    [DllImport("__Internal")]
    private static extern void Lose();

    [DllImport("__Internal")]
    private static extern int Lives();

    [DllImport("__Internal")]
    private static extern int Difficulty();

    [DllImport("__Internal")]
    private static extern float Timer();

    [DllImport("__Internal")]
    private static extern bool StartGame();

    [DllImport("__Internal")]
    private static extern void SetTimerMax(float time);

    private float time;

    private float maxTime = 20.0f;

    private bool timeChangesLocked = false;

    private bool isInGame = false;

    // For dev mode:
    private Scene startScene;

    // This way, you can call SetMaxTimer in the start function BEFORE gameStart is called.
    private void Start(){
        DontDestroyOnLoad(this.gameObject);
        #if UNITY_WEBGL && !UNITY_EDITOR
            isInGame = GameExists();
        #else
            // isInGame is false by default.
            time = 0.0f;
        #endif
        StartCoroutine(GameStartDelay());
    }

    IEnumerator GameStartDelay() {
        yield return new WaitForEndOfFrame();
        timeChangesLocked = true;
        if (isInGame) {
            StartGame();
        } else {
            startScene = SceneManager.GetActiveScene();
        }
    }

    public void WinGame(){
        if (isInGame){
            Win();
        } else {
            // Synchronous, because what else is there to do?
            Debug.Log("Game won. Reloading...");
            SceneManager.LoadScene(startScene.buildIndex);
            time = 0.0f;
        }
    }

    public void LoseGame(){
        if (isInGame){
            Lose();
        } else {
            Debug.Log("Game lost. Reloading...");
            SceneManager.LoadScene(startScene.buildIndex);
            time = 0.0f;
        }
    }

    public int GetDifficulty() {
        if (isInGame) {
            return Difficulty();
        } else {
            return defaultDifficulty;
        }
    }

    public int GetLives(){
        if (isInGame){
            return Lives();
        } else {
            return 3;
        }
    }

    public float GetTimer(){
        if (isInGame){
            return Timer();
        } else {
            return time;
        }
    }

    public bool IsInWebGL(){
        return isInGame;
    }

    public void SetMaxTimer(float time){
        if (!timeChangesLocked){
            if (isInGame) {
                SetTimerMax(time);
            } else {
                maxTime = time;
            }
        } else {
            Debug.LogError("SetMaxTimer(" + time + " seconds) call failed. Called AFTER Start(). Any changes to the maximum amount of allowed time must be made during the Start function in MonoBehaviour.");
        }
    }

    private void Update(){
        if(!isInGame){
            time += Time.deltaTime;
            if (time > maxTime){
                Debug.Log("Reached time limit!");
                LoseGame();
            }
        }
    }

}
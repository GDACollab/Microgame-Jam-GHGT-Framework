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

    private float _time;

    private float _maxTime = 20.0f;

    private bool _timeChangesLocked = false;

    private bool _isInGame = false;

    // For dev mode:
    private Scene _startScene;

    // This way, you can call SetMaxTimer in the start function BEFORE gameStart is called.
    private void Start(){
        DontDestroyOnLoad(this.gameObject);
        #if UNITY_WEBGL && !UNITY_EDITOR
            _isInGame = GameExists();
        #else
            // isInGame is false by default.
            _time = 0.0f;
        #endif
        StartCoroutine(GameStartDelay());
    }

    IEnumerator GameStartDelay() {
        yield return new WaitForEndOfFrame();
        _timeChangesLocked = true;
        if (_isInGame) {
            StartGame();
        } else {
            _startScene = SceneManager.GetActiveScene();
        }
    }

    public void WinGame(){
        if (_isInGame){
            Win();
        } else {
            // Synchronous, because what else is there to do?
            Debug.Log("Game won. Reloading...");
            SceneManager.LoadScene(_startScene.buildIndex);
            _time = 0.0f;
        }
    }

    public void LoseGame(){
        if (_isInGame){
            Lose();
        } else {
            Debug.Log("Game lost. Reloading...");
            SceneManager.LoadScene(_startScene.buildIndex);
            _time = 0.0f;
        }
    }

    public int GetDifficulty() {
        if (_isInGame) {
            return Difficulty();
        } else {
            return defaultDifficulty;
        }
    }

    public int GetLives(){
        if (_isInGame){
            return Lives();
        } else {
            return 3;
        }
    }

    public float GetTimer(){
        if (_isInGame){
            return Timer();
        } else {
            return _time;
        }
    }

    public bool IsInWebGL(){
        return _isInGame;
    }

    public void SetMaxTimer(float seconds){
        if (!_timeChangesLocked){
            if (_isInGame) {
                SetTimerMax(seconds);
            } else {
                _maxTime = seconds;
            }
        } else {
            Debug.LogError("SetMaxTimer(" + seconds + " seconds) call failed. Called AFTER Start(). Any changes to the maximum amount of allowed time must be made during the Start function in MonoBehaviour.");
        }
    }

    private void Update(){
        if(!_isInGame){
            _time += Time.deltaTime;
            if (_time > _maxTime){
                Debug.Log("Reached time limit!");
                LoseGame();
            }
        }
    }

}
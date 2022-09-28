using UnityEngine;
using System.Runtime.InteropServices;
using UnityEngine.SceneManagement;
using System.Collections;

public class MicrogameJamController : MonoBehaviour {
    const float MIN_TIME_ALLOWED = 5;
    const float MAX_TIME_ALLOWED = 15;

    [Range(1, 3)]
    public int defaultDifficulty = 1;

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
    private static extern void StartGame();

    [DllImport("__Internal")]
    private static extern void SetTimerMax(float time);

    [DllImport("__Internal")]
    private static extern bool GameExists();

    private float _time;

    private float _maxTime = MAX_TIME_ALLOWED;

    private bool _timeChangesLocked = false;

    private bool _isInGame = false;

    private bool _endGameLocked = false;

    // For dev mode:
    private int _startSceneBuildIndex;

    private void Awake(){
        #if UNITY_WEBGL && !UNITY_EDITOR
            _isInGame = GameExists();
        #else
            // isInGame is false by default.
            _time = 0.0f;
        #endif
    }

    // This way, you can call SetMaxTimer in the start function BEFORE gameStart is called.
    private void Start(){
        StartCoroutine(GameStartDelay());
    }

    IEnumerator GameStartDelay() {
        yield return new WaitForEndOfFrame();
        _timeChangesLocked = true;
        if (_isInGame) {
            StartGame();
        } else {
            _startSceneBuildIndex = SceneManager.GetActiveScene().buildIndex;
        }
    }

    public void WinGame(){
        if (!_endGameLocked){
            _endGameLocked = true;
            if (_isInGame){
                Win();
            } else {
                // Synchronous, because what else is there to do?
                Debug.Log("Game won. Reloading...");
                SceneManager.LoadScene(_startSceneBuildIndex);
                _endGameLocked = false;
                _timeChangesLocked = false;
                _time = 0.0f;
            }
        } else {
            Debug.LogWarning("Something tried to call WinGame() after game has already ended.");
        }
    }

    public void LoseGame(){
        if (!_endGameLocked){
            _endGameLocked = true;
            if (_isInGame){
                Lose();
            } else {
                Debug.Log("Game lost. Reloading...");
                SceneManager.LoadScene(_startSceneBuildIndex);
                _endGameLocked = false;
                _timeChangesLocked = false;
                _time = 0.0f;
            }
        } else {
            Debug.LogWarning("Something tried to call LoseGame() after game has already ended.");
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
            return _maxTime - _time;
        }
    }

    public void SetMaxTimer(float seconds){
        if (!_timeChangesLocked){
            if (seconds > MAX_TIME_ALLOWED){
                Debug.LogWarning("SetMaxTimer() of " + seconds + "s > " + MAX_TIME_ALLOWED + "s. Max timer set to " + MAX_TIME_ALLOWED + "s.");
                seconds = MAX_TIME_ALLOWED;
            } else if (seconds < MIN_TIME_ALLOWED) {
                Debug.LogWarning("SetMaxTimer() of " + seconds +"s < " + MIN_TIME_ALLOWED + "s. Max timer set to " + MIN_TIME_ALLOWED + "s.");
                seconds = MIN_TIME_ALLOWED;
            }
            if (_isInGame) {
                SetTimerMax(seconds);
            } else {
                _maxTime = seconds;
            }
        } else {
            Debug.LogWarning("SetMaxTimer(" + seconds + " seconds) call failed. Called AFTER Start(). Any changes to the maximum amount of allowed time must be made during the Start function in MonoBehaviour.");
        }
    }

    private void Update(){
        if(!_isInGame && !_endGameLocked){
            _time += Time.deltaTime;
            if (_time > _maxTime){
                Debug.Log("Reached time limit!");
                LoseGame();
            }
        }
    }

}
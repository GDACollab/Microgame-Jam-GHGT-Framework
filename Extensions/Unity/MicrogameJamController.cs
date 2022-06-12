using UnityEngine;
using System.Runtime.InteropServices;

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

    private bool isInGame = false;

    private bool gameOver = false;

    private void Start(){
        #if UNITY_WEBGL && !UNITY_EDITOR
            isInGame = StartGame();
        #else
            time = 0.0f;
        #endif
    }

    public void WinGame(){
        if (isInGame){
            Win();
        } else {
            time = 0.0f;
            gameOver = true;
        }
        Debug.Log("Game won.");
    }

    public void LoseGame(){
        if (isInGame){
            Lose();
        } else {
            time = 0.0f;
            gameOver = true;
        }
        Debug.Log("Game lost.");
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
        if (isInGame) {
            SetTimerMax(time);
        }
    }

    private void Update(){
        if(!isInGame && !gameOver){
            time += Time.deltaTime;
            if (time > maxTime){
                gameOver = true;
                Debug.Log("Reached time limit!");
                LoseGame();
            }
        }
    }

}
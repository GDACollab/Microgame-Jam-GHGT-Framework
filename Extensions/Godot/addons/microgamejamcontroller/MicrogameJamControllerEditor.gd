tool
extends EditorPlugin

func _enter_tree():
	add_autoload_singleton("MicrogameJamController", "res://addons/microgamejamcontroller/MicrogameJamController.gd")


func _exit_tree():
	remove_autoload_singleton("MicrogameJamController")

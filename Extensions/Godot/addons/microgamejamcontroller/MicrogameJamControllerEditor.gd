tool
extends EditorPlugin

var popup;
var alert_popup;
func matches_settings():
	var view_width = ProjectSettings.get_setting("display/window/size/width");
	var view_height = ProjectSettings.get_setting("display/window/size/height");
	var size_matches = (view_width == 960 and view_height == 540);
	return size_matches

func _enter_tree():
	popup = ConfirmationDialog.new()
	popup.window_title = "Microgame Jam Editor - Update Project Settings?";
	popup.dialog_text = "Update your project settings to match recommended,\nand sometimes required, Microgame Jam project settings?";
	popup.rect_min_size = Vector2(200, 100);
	popup.connect("confirmed", self, "_update_settings");
	popup.get_cancel().connect("pressed", self, "_not_updated");
	popup.get_close_button().connect("pressed", self, "_not_updated");
	popup.popup_exclusive = true;
	
	alert_popup = AcceptDialog.new()
	alert_popup.window_title = "Microgame Jam Editor";
	alert_popup.dialog_text = """
		That's not recommended, and your game may not be accepted if you go through with this.\n
		Please make sure your game follows the guidelines as specified on the jam's itch page.\n
		If you change your mind, you can always update the menu from:\n
		Project->Tools->Microgame Jam Controller Settings Update section.
	""";
	alert_popup.popup_exclusive = true;
	alert_popup.rect_min_size = Vector2(200, 100);
	
	if not matches_settings():
		# Wait a frame for the full canvas to be set up:
		yield(get_tree(), "idle_frame");
		add_child(popup);
		popup.popup_centered();
	add_autoload_singleton("MicrogameJamController", "res://addons/microgamejamcontroller/MicrogameJamController.gd")
	add_tool_menu_item("Microgame Jam Controller Settings Update", self, "_update_settings");

func _update_settings():
	print("[Microgame Jam Controller Editor] Updating settings to match recommend Microgame Jam settings...");
	ProjectSettings.set_setting("display/window/size/width", 960);
	ProjectSettings.set_setting("display/window/size/height", 540);

func _not_updated():
	add_child(alert_popup);
	alert_popup.popup_centered();

func _exit_tree():
	popup.free();
	alert_popup.free();
	remove_autoload_singleton("MicrogameJamController");
	remove_tool_menu_item("Microgame Jam Controller Settings Update");

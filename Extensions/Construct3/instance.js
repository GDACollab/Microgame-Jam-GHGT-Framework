
const SDK = self.SDK;

const PLUGIN_CLASS = SDK.Plugins.GDACollab_MicrogameJamController;

PLUGIN_CLASS.Instance = class MicrogameJamControllerInstance extends SDK.IInstanceBase
{
	constructor(sdkType, inst)
	{
		super(sdkType, inst);
	}
	
	Release()
	{
	}
	
	OnCreate()
	{
	}
	
	OnPropertyChanged(id, value)
	{
	}
	
	LoadC2Property(name, valueString)
	{
		return false;		// not handled
	}
};

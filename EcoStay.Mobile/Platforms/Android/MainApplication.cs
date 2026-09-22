using Android.App;
using Android.Runtime;

namespace EcoStay.Mobile;

[Application]
public class MainApplication : MauiApplication
{
	public MainApplication(IntPtr handle, JniHandleOwnership ownership)
		: base(handle, ownership)
	{
		AndroidEnvironment.UnhandledExceptionRaiser += (sender, args) =>
		{
			System.Diagnostics.Debug.WriteLine($"[AndroidEnvironment FATAL] {args.Exception}");
			args.Handled = true;
		};

		AppDomain.CurrentDomain.UnhandledException += (sender, args) =>
		{
			System.Diagnostics.Debug.WriteLine($"[AppDomain Unhandled] {args.ExceptionObject}");
		};

		TaskScheduler.UnobservedTaskException += (sender, args) =>
		{
			System.Diagnostics.Debug.WriteLine($"[TaskScheduler Unobserved] {args.Exception}");
			args.SetObserved();
		};
	}

	protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}

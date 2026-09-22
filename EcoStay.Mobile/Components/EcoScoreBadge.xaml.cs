namespace EcoStay.Mobile.Components;

public partial class EcoScoreBadge : ContentView
{
    public static readonly BindableProperty ScoreProperty =
        BindableProperty.Create(
            nameof(Score),
            typeof(double),
            typeof(EcoScoreBadge),
            0.0);

    public double Score
    {
        get => (double)GetValue(ScoreProperty);
        set => SetValue(ScoreProperty, value);
    }

    public EcoScoreBadge()
    {
        InitializeComponent();
    }
}

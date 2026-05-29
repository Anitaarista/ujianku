import 'dart:async';
import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../utils/helpers.dart';

/// Widget countdown timer untuk ujian
class CountdownTimer extends StatefulWidget {
  /// Total durasi dalam detik
  final int totalSeconds;

  /// Sisa waktu saat ini dalam detik
  final int remainingSeconds;

  /// Callback saat waktu habis
  final VoidCallback? onTimeUp;

  /// Apakah timer aktif
  final bool isRunning;

  /// Ukuran teks
  final double fontSize;

  /// Apakah menampilkan label
  final bool showLabel;

  const CountdownTimer({
    super.key,
    required this.totalSeconds,
    required this.remainingSeconds,
    this.onTimeUp,
    this.isRunning = true,
    this.fontSize = 20,
    this.showLabel = false,
  });

  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer>
    with TickerProviderStateMixin {
  late int _remainingSeconds;
  Timer? _timer;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.remainingSeconds;
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    if (widget.isRunning) _startTimer();
  }

  @override
  void didUpdateWidget(CountdownTimer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.remainingSeconds != widget.remainingSeconds) {
      _remainingSeconds = widget.remainingSeconds;
    }
    if (widget.isRunning && !oldWidget.isRunning) {
      _startTimer();
    } else if (!widget.isRunning && oldWidget.isRunning) {
      _timer?.cancel();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });

        // Animasi pulse saat waktu < 5 menit
        if (_remainingSeconds < 300 && _remainingSeconds > 0) {
          _pulseController.forward(from: 0);
        }
      } else {
        timer.cancel();
        widget.onTimeUp?.call();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  /// Persentase waktu tersisa
  double get _progress {
    if (widget.totalSeconds == 0) return 0;
    return _remainingSeconds / widget.totalSeconds;
  }

  /// Apakah waktu hampir habis (< 5 menit)
  bool get _isWarning => _remainingSeconds < 300;

  /// Apakah waktu kritis (< 1 menit)
  bool get _isCritical => _remainingSeconds < 60;

  /// Warna timer berdasarkan sisa waktu
  Color get _timerColor {
    if (_isCritical) return AppTheme.error;
    if (_isWarning) return AppTheme.warning;
    return AppTheme.primary;
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        final scale = _isWarning
            ? 1.0 + (_pulseController.value * 0.05)
            : 1.0;

        return Transform.scale(
          scale: scale,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: _timerColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _timerColor.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Ikon timer
                Icon(
                  _isCritical ? Icons.timer_off : Icons.timer_outlined,
                  color: _timerColor,
                  size: 20,
                ),
                const SizedBox(width: 8),

                // Waktu terformat
                Text(
                  Helpers.formatCountdown(_remainingSeconds),
                  style: TextStyle(
                    color: _timerColor,
                    fontSize: widget.fontSize,
                    fontWeight: FontWeight.w700,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),

                // Progress indicator
                if (widget.showLabel) ...[
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      value: _progress,
                      strokeWidth: 3,
                      backgroundColor: _timerColor.withValues(alpha: 0.2),
                      valueColor: AlwaysStoppedAnimation<Color>(_timerColor),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Widget countdown timer mini untuk ditampilkan di AppBar
class MiniCountdownTimer extends StatelessWidget {
  final int remainingSeconds;
  final int totalSeconds;

  const MiniCountdownTimer({
    super.key,
    required this.remainingSeconds,
    required this.totalSeconds,
  });

  @override
  Widget build(BuildContext context) {
    final isWarning = remainingSeconds < 300;
    final isCritical = remainingSeconds < 60;
    final color = isCritical
        ? AppTheme.error
        : isWarning
            ? AppTheme.warning
            : AppTheme.primary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isCritical ? Icons.timer_off : Icons.timer_outlined,
            color: color,
            size: 16,
          ),
          const SizedBox(width: 4),
          Text(
            Helpers.formatCountdown(remainingSeconds),
            style: TextStyle(
              color: color,
              fontSize: 14,
              fontWeight: FontWeight.w700,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}

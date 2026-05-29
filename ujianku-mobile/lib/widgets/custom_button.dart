import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Tombol kustom dengan berbagai varian untuk aplikasi UjianKu
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final CustomButtonVariant variant;
  final CustomButtonSize size;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final IconData? trailingIcon;
  final Color? customColor;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = CustomButtonVariant.primary,
    this.size = CustomButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.trailingIcon,
    this.customColor,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getSizeConfig(size);
    final colors = _getColorConfig(context);

    Widget child = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading)
          SizedBox(
            width: config.iconSize,
            height: config.iconSize,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(colors.foregroundColor),
            ),
          )
        else ...[
          if (icon != null) ...[
            Icon(icon, size: config.iconSize, color: colors.foregroundColor),
            SizedBox(width: config.iconSpacing),
          ],
          Text(
            text,
            style: TextStyle(
              color: colors.foregroundColor,
              fontSize: config.fontSize,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (trailingIcon != null) ...[
            SizedBox(width: config.iconSpacing),
            Icon(trailingIcon, size: config.iconSize, color: colors.foregroundColor),
          ],
        ],
      ],
    );

    switch (variant) {
      case CustomButtonVariant.primary:
      case CustomButtonVariant.danger:
        return SizedBox(
          width: isFullWidth ? double.infinity : null,
          height: config.height,
          child: ElevatedButton(
            onPressed: isLoading ? null : onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: colors.backgroundColor,
              foregroundColor: colors.foregroundColor,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(config.borderRadius),
              ),
              disabledBackgroundColor: colors.backgroundColor?.withValues(alpha: 0.5),
            ),
            child: child,
          ),
        );

      case CustomButtonVariant.outline:
        return SizedBox(
          width: isFullWidth ? double.infinity : null,
          height: config.height,
          child: OutlinedButton(
            onPressed: isLoading ? null : onPressed,
            style: OutlinedButton.styleFrom(
              foregroundColor: colors.foregroundColor,
              side: BorderSide(color: colors.borderColor ?? AppTheme.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(config.borderRadius),
              ),
            ),
            child: child,
          ),
        );

      case CustomButtonVariant.ghost:
        return SizedBox(
          width: isFullWidth ? double.infinity : null,
          height: config.height,
          child: TextButton(
            onPressed: isLoading ? null : onPressed,
            style: TextButton.styleFrom(
              foregroundColor: colors.foregroundColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(config.borderRadius),
              ),
            ),
            child: child,
          ),
        );
    }
  }

  _SizeConfig _getSizeConfig(CustomButtonSize size) {
    switch (size) {
      case CustomButtonSize.small:
        return _SizeConfig(
          height: 36,
          fontSize: 13,
          iconSize: 16,
          iconSpacing: 6,
          borderRadius: 8,
        );
      case CustomButtonSize.medium:
        return _SizeConfig(
          height: 48,
          fontSize: 15,
          iconSize: 20,
          iconSpacing: 8,
          borderRadius: 12,
        );
      case CustomButtonSize.large:
        return _SizeConfig(
          height: 56,
          fontSize: 17,
          iconSize: 22,
          iconSpacing: 10,
          borderRadius: 14,
        );
    }
  }

  _ColorConfig _getColorConfig(BuildContext context) {
    switch (variant) {
      case CustomButtonVariant.primary:
        return _ColorConfig(
          backgroundColor: customColor ?? AppTheme.primary,
          foregroundColor: Colors.white,
          borderColor: customColor ?? AppTheme.primary,
        );
      case CustomButtonVariant.outline:
        return _ColorConfig(
          backgroundColor: Colors.transparent,
          foregroundColor: customColor ?? AppTheme.primary,
          borderColor: customColor ?? AppTheme.primary,
        );
      case CustomButtonVariant.ghost:
        return _ColorConfig(
          backgroundColor: Colors.transparent,
          foregroundColor: customColor ?? AppTheme.primary,
          borderColor: Colors.transparent,
        );
      case CustomButtonVariant.danger:
        return _ColorConfig(
          backgroundColor: AppTheme.error,
          foregroundColor: Colors.white,
          borderColor: AppTheme.error,
        );
    }
  }
}

/// Varian tombol
enum CustomButtonVariant {
  primary,
  outline,
  ghost,
  danger,
}

/// Ukuran tombol
enum CustomButtonSize {
  small,
  medium,
  large,
}

/// Konfigurasi ukuran
class _SizeConfig {
  final double height;
  final double fontSize;
  final double iconSize;
  final double iconSpacing;
  final double borderRadius;

  const _SizeConfig({
    required this.height,
    required this.fontSize,
    required this.iconSize,
    required this.iconSpacing,
    required this.borderRadius,
  });
}

/// Konfigurasi warna
class _ColorConfig {
  final Color? backgroundColor;
  final Color foregroundColor;
  final Color? borderColor;

  const _ColorConfig({
    required this.backgroundColor,
    required this.foregroundColor,
    required this.borderColor,
  });
}

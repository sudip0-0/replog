import type { TextStyle, ViewStyle } from 'react-native';
import { replogColors } from './index';

export const ui: {
  card: ViewStyle;
  cardHigh: ViewStyle;
  row: ViewStyle;
  sheet: ViewStyle;
  grabber: ViewStyle;
  dataText: TextStyle;
  label: TextStyle;
} = {
  card: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHigh: {
    backgroundColor: replogColors.surfaceContainer,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  sheet: {
    backgroundColor: replogColors.surface,
    borderColor: replogColors.outline,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: replogColors.surfaceHighest,
    borderRadius: 2,
    height: 4,
    marginBottom: 8,
    width: 44,
  },
  dataText: {
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 24,
  },
  label: {
    color: replogColors.textDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
};

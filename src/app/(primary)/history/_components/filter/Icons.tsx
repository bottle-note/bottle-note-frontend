import React, { FC } from 'react';

interface IconProps {
  color?: string;
  className?: string;
  size?: number;
}

const defaultProps: Partial<IconProps> = {
  color: '#BFBFBF',
  className: '',
  size: 4,
};

export const StarIcon: FC<IconProps> = ({
  color = defaultProps.color,
  className = defaultProps.className,
  size = defaultProps.size,
}) => (
  <svg
    className={`w-${size} h-${size} ${className}`}
    width="13"
    height="13"
    viewBox="0 0 10 10"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.26937 7.46043L2.70429 8.79122C2.66998 8.80902 2.62772 8.79563 2.60992 8.76132C2.60295 8.74788 2.60052 8.73255 2.603 8.71762L3.076 5.86685C3.08221 5.82942 3.06982 5.7913 3.04279 5.76466L0.98449 3.73636C0.956954 3.70923 0.956628 3.6649 0.983764 3.63737C0.994386 3.62659 1.00822 3.61954 1.02318 3.61728L3.88059 3.1862C3.91811 3.18054 3.95054 3.15698 3.96752 3.12304L5.2605 0.538695C5.27779 0.504121 5.31984 0.490115 5.35442 0.507413C5.36795 0.514185 5.37893 0.52516 5.3857 0.538695L6.67868 3.12304C6.69566 3.15698 6.72808 3.18054 6.76561 3.1862L9.62302 3.61728C9.66124 3.62305 9.68756 3.65872 9.68179 3.69694C9.67953 3.71191 9.67248 3.72574 9.6617 3.73636L7.6034 5.76466C7.57637 5.7913 7.56398 5.82942 7.5702 5.86685L8.0432 8.71762C8.04952 8.75576 8.02374 8.79181 7.9856 8.79814C7.97067 8.80061 7.95534 8.79819 7.9419 8.79122L5.37683 7.46043C5.34314 7.44296 5.30306 7.44296 5.26937 7.46043Z"
      strokeWidth="0.6"
      strokeLinejoin="round"
      fill={color}
    />
  </svg>
);

export const ReviewIcon: FC<IconProps> = ({
  color = defaultProps.color,
  className = defaultProps.className,
  size = defaultProps.size,
}) => (
  <svg
    className={`w-${size} h-${size} ${className}`}
    width="14"
    height="15"
    viewBox="0 0 14 15"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.09903 13.1886C2.46593 13.3084 1.8556 12.8922 1.73582 12.2591C1.70871 12.1158 1.70871 11.9687 1.73582 11.8254L2.1208 9.79049C2.16439 9.56011 2.27638 9.3482 2.44218 9.1824L9.27727 2.34731C9.63236 1.99222 10.1748 1.90419 10.624 2.12877L11.0729 2.35322C11.7213 2.67741 12.247 3.20315 12.5712 3.85153L12.7956 4.30044C13.0202 4.74959 12.9322 5.29206 12.5771 5.64714L5.74201 12.4822C5.57621 12.648 5.36431 12.76 5.13392 12.8036L3.09903 13.1886ZM8.95624 4.31908L10.6062 5.969L11.7521 4.82218L11.5277 4.37328C11.3164 3.95068 10.9737 3.60802 10.5511 3.39672L10.1022 3.17227L8.95624 4.31908ZM3.2401 10.1524L4.77288 11.6851L4.91705 11.6573L9.7812 6.79396L8.13128 5.14404L3.26713 10.0074L3.2401 10.1524Z"
      fill={color}
    />
  </svg>
);

export const LikeIcon: FC<IconProps> = ({
  color = defaultProps.color,
  className = defaultProps.className,
  size = defaultProps.size,
}) => (
  <svg
    className={`w-${size} h-${size} ${className}`}
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Like Filled">
      <path
        id="Icon"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d="M15.9427 26.7368C15.7733 26.8871 15.602 27.0172 15.429 27.1509C15.179 27.3439 14.821 27.3439 14.5711 27.1508C14.3982 27.0171 14.2272 26.8871 14.0579 26.7368C6.33371 19.8794 2.40872 16.0335 2.50161 10.6944C2.50161 6.85913 5.92134 3.75 10.1398 3.75C11.9862 3.75 13.6796 4.34565 15.0002 5.33713C16.3208 4.34565 18.0142 3.75 19.8606 3.75C24.079 3.75 27.4988 6.85913 27.4988 10.6944C27.5917 16.0335 23.6667 19.8795 15.9427 26.7368Z"
      />
    </g>
  </svg>
);

export const Icons = {
  Star: StarIcon,
  Review: ReviewIcon,
  Like: LikeIcon,
};

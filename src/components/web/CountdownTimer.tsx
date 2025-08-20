
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from "class-variance-authority"

const countdownVariants = cva(
  "flex items-center justify-center gap-0 text-center font-mono",
  {
    variants: {
      variant: {
        default: "text-xs",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const timeSegmentVariants = cva(
  "flex flex-col items-center rounded-md",
   {
    variants: {
      variant: {
        default: "w-7",
        lg: "w-14",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const timeUnitVariants = cva(
    "text-center",
   {
    variants: {
      variant: {
        default: "text-[8px] tracking-tighter font-bold",
        lg: "text-xs tracking-widest",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const timeValueVariants = cva(
    "font-bold",
    {
      variants: {
        variant: {
          default: "text-base",
          lg: "text-2xl",
        }
      },
      defaultVariants: {
        variant: "default",
      }
    }
)


interface CountdownTimerProps extends VariantProps<typeof countdownVariants> {
  expiryDate: string;
}

const intervalMap: { [key: string]: string } = {
    days: 'Days',
    hours: 'Hrs',
    minutes: 'Mins',
    seconds: 'Secs'
};


export const CountdownTimer = ({ expiryDate, variant }: CountdownTimerProps) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    if (value < 0) return null;

    return (
      <div key={interval} className={cn(timeSegmentVariants({variant}))}>
        <span className={cn(timeValueVariants({variant}))}>{String(value).padStart(2, '0')}</span>
        <span className={cn(timeUnitVariants({variant}))}>{intervalMap[interval]}</span>
      </div>
    );
  });
  
  const separator = <span className={cn("font-bold -mt-2", variant === 'lg' ? 'text-xl' : 'text-base', variant === 'default' && '-mx-0.5')}>:</span>

  return (
    <div className={cn(countdownVariants({variant}))}>
      {timerComponents.length ? (
        <>
            {timerComponents[0]}
            {separator}
            {timerComponents[1]}
            {separator}
            {timerComponents[2]}
            {separator}
            {timerComponents[3]}
        </>
      ) : (
        <span className="font-bold uppercase tracking-wider">Offer Expired!</span>
      )}
    </div>
  );
};

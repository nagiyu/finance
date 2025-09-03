import React, { useEffect, useState } from 'react';

import ReactECharts from 'echarts-for-react';

export interface CandleStickData {
    date: string;
    data: [number, number, number, number];
}

type CandleStickProps = {
    data: CandleStickData[];
}

function getOption(data: CandleStickData[], isMobile: boolean) {
    return {
        grid: {
            left: isMobile ? '15%' : '10%',
            right: isMobile ? '15%' : '10%',
            bottom: isMobile ? '25%' : '20%',
            top: '10%'
        },
        xAxis: {
            data: data.map(item => item.date),
            axisLabel: {
                rotate: isMobile ? 45 : 0,
                fontSize: isMobile ? 10 : 12,
                interval: isMobile ? 'auto' : 0
            }
        },
        yAxis: {
            scale: true,
            axisLabel: {
                fontSize: isMobile ? 10 : 12
            }
        },
        series: [
            {
                type: 'candlestick',
                data: data.map(item => item.data)
            }
        ]
    }
}

export default function CandleStick({ data }: CandleStickProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return (
        <ReactECharts option={getOption(data, isMobile)} />
    );
}

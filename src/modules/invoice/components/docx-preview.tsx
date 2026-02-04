import * as docx from 'docx-preview';
import { useEffect, useRef, useState } from 'react';

type Props = {
    filePath: string;
};

export default function DocxViewer({ filePath }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScale(width / 800); // Scale theo mobile
            } else {
                setScale(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // useEffect(() => {
    //     const renderDocx = async () => {
    //         try {
    //             const response = await fetch(filePath);
    //             const template = await response.arrayBuffer();
    //             if (containerRef.current) {
    //                 const el = containerRef.current as HTMLElement;
    //                 await docx.renderAsync(template, el);
    //             }
    //         } catch (error) {
    //             console.error('Error rendering DOCX:', error);
    //         }
    //     };

    //     if (filePath) {
    //         renderDocx();
    //     } else {
    //         if (containerRef.current) {
    //             containerRef.current.innerHTML = '';
    //         }
    //     }

    //     return () => {
    //         if (containerRef.current) {
    //             containerRef.current.innerHTML = '';
    //         }
    //     };
    // }, [filePath]);

    useEffect(() => {
        let cancelled = false;

        const renderDocx = async () => {
            try {
                const response = await fetch(filePath);
                const template = await response.arrayBuffer();

                if (!containerRef.current || cancelled) return;

                // render vào temp node (không đụng UI hiện tại)
                const temp = document.createElement('div');
                await docx.renderAsync(template, temp);

                if (cancelled || !containerRef.current) return;

                // swap: thay nội dung 1 phát sau khi đã render xong
                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(temp);
            } catch (e) {
                console.error('Error rendering DOCX:', e);
            }
        };

        if (filePath) renderDocx();

        return () => {
            cancelled = true; // tránh race khi đổi file nhanh
        };
    }, [filePath]);

    return (
        <div
            style={{
                height: '100%',
                overflow: 'auto',
                width: '100%',
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: scale < 1 ? `${100 / scale}%` : '100%',
                    height: scale < 1 ? `${100 / scale}%` : 'auto',
                }}
            >
                <div ref={containerRef} />
            </div>
        </div>
    );
}

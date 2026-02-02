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

    useEffect(() => {
        const renderDocx = async () => {
            try {
                const response = await fetch(filePath);
                const template = await response.arrayBuffer();
                if (containerRef.current) {
                    const el = containerRef.current as HTMLElement;
                    await docx.renderAsync(template, el);
                }
            } catch (error) {
                // Handle any potential errors during rendering
                console.error('Error rendering DOCX:', error);
            }
        };

        if (filePath) {
            renderDocx();
        } else {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        }

        return () => {
            // Clear the rendered content from the container when unmounting
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [filePath]);

    return (
        <div style={{ 
            height: '100%', 
            overflow: 'auto',
            width: '100%'
        }}>
            <div 
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: scale < 1 ? `${100 / scale}%` : '100%',
                    height: scale < 1 ? `${100 / scale}%` : 'auto'
                }}
            >
                <div ref={containerRef} />
            </div>
        </div>
    );
}

import * as docx from 'docx-preview';
import { useEffect, useRef } from 'react';

type Props = {
    filePath: string;
};

export default function DocxViewer({ filePath }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

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
        <div style={{ height: '100%', overflow: 'auto' }}>
            <div ref={containerRef} />
        </div>
    );
}

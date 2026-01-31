import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import ImageModule from 'docxtemplater-image-module-free';

// Helper function to download blob
export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Helper function to convert docx to pdf using browser print
export const convertToPdf = async (docxBlob: Blob, filename: string) => {
    // For now, we'll download the docx and suggest using online converter
    // In a real implementation, you might use a library like pdf-lib or server-side conversion
    downloadBlob(docxBlob, filename.replace('.pdf', '.docx'));
    console.log('PDF conversion requires server-side processing or additional libraries');
};

export const generateDocument = async ({
    data,
    readUrl,
    onPreview,
    onDownload,
}: {
    data: any;
    readUrl: string;
    onPreview: (blobUrl: string) => void;
    onDownload?: (blob: Blob, filename: string) => void;
}) => {
    if (!readUrl) return;

    try {
        // 1. Load file template (.docx)
        const arrayBuffer = await fetch(readUrl)
            .then((res) => res.arrayBuffer())
            .catch((err) => {
                console.error('FETCH DOCX FAIL:', err);
                return null;
            });

        if (!arrayBuffer) {
            console.error('arrayBuffer is null => cannot load docx');
            return;
        }

        // 2. Tạo PizZip
        const zip = new PizZip(arrayBuffer);

        // 3. Configure image module
        const imageModule = new ImageModule({
            centered: false,
            getImage: (tagValue: string) => {
                if (tagValue && tagValue.startsWith('data:image')) {
                    // Convert base64 to binary
                    const base64Data = tagValue.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    return bytes;
                }
                return null;
            },
            getSize: () => {
                return [200, 80]; // width, height in pixels - reasonable size for signature
            },
        });

        // 4. Khởi tạo Docxtemplater với image module
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => '',
            modules: [imageModule],
        });

        // 5. Set dữ liệu
        doc.setData(data);

        // 6. Render
        doc.render();

        // 6. Xuất file blob
        const output = doc.getZip().generate({
            type: 'blob',
            mimeType:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // 7. Tạo URL để dùng trong DocxViewer
        const blobUrl = URL.createObjectURL(output);

        // 8. Callback cho download nếu có
        if (onDownload) {
            const filename = `invoice-${data.invoiceNumber || 'unknown'}.docx`;
            onDownload(output, filename);
        }

        onPreview(blobUrl);
    } catch (error) {
        console.error('DOCX render error:', error);
        throw error;
    }
};

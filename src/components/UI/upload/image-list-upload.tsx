import { Image, Upload, type UploadFile, type UploadProps } from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';

type FileType = {
    name: string;
    type: string;
    uid: string;
    size?: number;
    lastModified?: number;
    originFileObj?: File;
};

type Props = UploadProps & {
    value?: any;
};

const getBase64 = (file: File | FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file as File);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export default function ImageListUpload({ value, ...props }: Props) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const fileList = value?.fileList || [];

    function beforeUpload(file: File) {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            return Upload.LIST_IGNORE;
        }
        return false;
    }

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            const fileToConvert = file.originFileObj || file;
            file.preview = await getBase64(fileToConvert as FileType);
        }

        setPreviewImage(file.url || file.preview || '');
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        props.onChange?.(info);
    };

    const uploadButton = (
        <button className="flex flex-col items-center" type="button">
            <Plus />
            <div style={{ marginTop: 8 }}> {'Upload'} </div>
        </button>
    );

    return (
        <>
            <Upload
                listType="picture-card"
                multiple
                {...props}
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={beforeUpload}
            >
                {fileList.length >= (props.maxCount || 1) ? null : uploadButton}
            </Upload>
            {previewImage && (
                <Image
                    alt=""
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) =>
                            !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
        </>
    );
}

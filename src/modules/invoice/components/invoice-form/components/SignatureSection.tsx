import { Button, Card, Input, Tabs } from 'antd';
import SignatureCanvas from 'react-signature-canvas';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';
import ImageListUpload from '../../../../../components/UI/upload/image-list-upload';

interface SignatureSectionProps {
    activeTab: string;
    setActiveTab: (key: string) => void;
    signatureRef: React.RefObject<SignatureCanvas | null>;
    clearSignature: () => void;
    saveSignature: () => void;
}

export const SignatureSection = ({
    activeTab,
    setActiveTab,
    signatureRef,
    clearSignature,
    saveSignature,
}: SignatureSectionProps) => {
    return (
        <Card size="small" title="Signature">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'draw',
                        label: 'Draw Signature',
                        children: (
                            <>
                                <AppFormItem
                                    label="Full name"
                                    name="fullname"
                                    layout="vertical"
                                    labelCol={{
                                        span: 24,
                                    }}
                                    wrapperCol={{
                                        span: 24,
                                    }}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please input your full name!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </AppFormItem>
                                <AppFormItem
                                    label=""
                                    name="signatureCanvas"
                                    labelCol={{
                                        span: 24,
                                    }}
                                    wrapperCol={{
                                        span: 24,
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                border: '1px dashed #ccc',
                                                width: '100%',
                                                maxWidth: '100%',
                                                height: '150px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                            }}
                                        >
                                            <SignatureCanvas
                                                ref={signatureRef}
                                                penColor="black"
                                                canvasProps={{
                                                    className:
                                                        'signature-canvas',
                                                    style: {
                                                        width: '100%',
                                                        height: '150px',
                                                    },
                                                }}
                                                clearOnResize={false}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                marginTop: '8px',
                                                display: 'flex',
                                                gap: '8px',
                                            }}
                                        >
                                            <Button onClick={clearSignature}>
                                                Clear
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={saveSignature}
                                            >
                                                Save Signature
                                            </Button>
                                        </div>
                                    </div>
                                </AppFormItem>
                            </>
                        ),
                    },
                    {
                        key: 'upload',
                        label: 'Upload Signature',
                        children: (
                            <>
                                <AppFormItem
                                    name="fullname"
                                    label="Full name"
                                    layout="vertical"
                                    labelCol={{
                                        span: 24,
                                    }}
                                    wrapperCol={{
                                        span: 24,
                                    }}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please input your full name!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </AppFormItem>
                                <AppFormItem label="" name="signatureUpload">
                                    <ImageListUpload maxCount={1} />
                                </AppFormItem>
                            </>
                        ),
                    },
                ]}
            />
        </Card>
    );
};

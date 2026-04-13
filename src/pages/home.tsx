import {
    DownOutlined,
    FilePdfOutlined,
    FileWordOutlined,
} from '@ant-design/icons';
import type { FormProps } from 'antd';
import { Button, Card, Col, Dropdown, Form, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { DATE_FORMAT } from '../common/enums/common';
import { formattedDate } from '../common/helpers/date';
import AppForm from '../components/UI/antd-form/form';
import DocxViewer from '../modules/invoice/components/docx-preview';
import { BankInfoSection } from '../modules/invoice/components/invoice-form/components/BankInfoSection';
import { BillToSection } from '../modules/invoice/components/invoice-form/components/BillToSection';
import { InvoiceInfoSection } from '../modules/invoice/components/invoice-form/components/InvoiceInfoSection';
import { PartnerInfoSection } from '../modules/invoice/components/invoice-form/components/PartnerInfoSection';
import { PaymentItemsSection } from '../modules/invoice/components/invoice-form/components/PaymentItemsSection';
import { SignatureSection } from '../modules/invoice/components/invoice-form/components/SignatureSection';
import {
    COMPANY_ADDRESS,
    COMPANY_ID,
    COMPANY_NAME,
    TAX_ID,
} from '../modules/invoice/constants';
import { downloadBlob, generateDocument } from '../modules/invoice/helpers';
import { useConvertWordToPdf } from '../modules/invoice/hooks/use-convert-word-to-pdf';

const generateRandomSuffix = (date?: Date) => {
    const targetDate = date || new Date();
    const dateStr =
        targetDate.getDate().toString().padStart(2, '0') +
        (targetDate.getMonth() + 1).toString().padStart(2, '0') +
        targetDate.getFullYear().toString();
    const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `INV-${dateStr}-${randomNum}`;
};

export default function Home() {
    const [form] = Form.useForm();
    const [invoiceNumber, setInvoiceNumber] = useState(generateRandomSuffix());
    const [linkPreview, setLinkPreview] = useState<string>(
        '/preview/template-user.docx'
    );
    const [activeTab, setActiveTab] = useState<string>('draw');
    const [pendingSignatureCanvas, setPendingSignatureCanvas] =
        useState<string>('');
    const [shouldRefreshPreviewAfterImport, setShouldRefreshPreviewAfterImport] =
        useState(false);
    const { convertToPdf, isPending } = useConvertWordToPdf();
    const signatureRef = useRef<SignatureCanvas>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const currencyOptions = [
        { value: 'EUR', label: 'EUR (€)', locale: 'de-DE', symbol: '€' },
        { value: 'USD', label: 'USD ($)', locale: 'en-US', symbol: '$' },
        { value: 'GBP', label: 'GBP (£)', locale: 'en-GB', symbol: '£' },
        { value: 'SGD', label: 'SGD (S$)', locale: 'en-SG', symbol: 'S$' },
        { value: 'HKD', label: 'HKD (HK$)', locale: 'zh-HK', symbol: 'HK$' },
        { value: 'CNY', label: 'CNY (¥)', locale: 'zh-CN', symbol: '¥' },
        { value: 'VND', label: 'VND (₫)', locale: 'vi-VN', symbol: '₫' },
    ];

    const handleReloadInvoice = () => {
        // Get current invoice date from form, fallback to today
        const formData = form.getFieldsValue();
        const invoiceDate = formData.invoiceDate
            ? formData.invoiceDate.toDate()
            : new Date();
        const newInvoiceNumber = generateRandomSuffix(invoiceDate);
        setInvoiceNumber(newInvoiceNumber);

        // Force update form and trigger preview
        form.setFieldsValue({
            invoiceNumber: newInvoiceNumber,
        });

        // Also manually trigger preview as fallback
        setTimeout(() => handlePreview(), 0);
    };

    const onFinish: FormProps['onFinish'] = (values) => {
        console.log('Form values:', values);
    };

    const getCurrentDrawSignature = useCallback(() => {
        const formSignature = form.getFieldValue('signatureCanvas');

        if (signatureRef.current) {
            const canvasSignature = signatureRef.current.toDataURL();
            if (canvasSignature && canvasSignature !== 'data:,') {
                return canvasSignature;
            }
        }

        return formSignature || '';
    }, [form]);

    const handlePreview = useCallback(() => {
        const data = form.getFieldsValue();
        const invoiceDate = formattedDate(
            data.invoiceDate,
            DATE_FORMAT.DATE_ONLY
        );
        const total = data?.s?.reduce(
            (acc: number, s: any) => acc + Number(s.amount || 0),
            0
        );
        // Get currency symbol
        const selectedCurrency = currencyOptions.find(
            (option) => option.value === data.currency
        );
        const symbolCurrency = selectedCurrency?.symbol || '';

        // Get signature data - prioritize uploaded image over canvas signature
        let signatureImage = '';

        const generateDocWithSignature = (signatureImage: string) => {
            // Get locale from selected currency
            const selectedCurrency = currencyOptions.find(
                (option) => option.value === data.currency
            );
            const locale = selectedCurrency?.locale || 'en-US';

            // Helper function to clean address fields
            const cleanAddress = (address: string) => {
                if (!address) return '';
                const trimmed = address.trim();
                // Remove lines that are empty or contain only whitespace
                const lines = trimmed
                    .split('\n')
                    .filter((line) => line.trim().length > 0);
                return lines.join('\n');
            };
            // const isHasRoutingNumber =
            //     !!data?.routingNumber && String(data?.routingNumber).length > 0;
            // const isHasAccountType =
            //     !!data?.accountType && data?.accountType?.length > 0;
            // Format amount fields with currency-specific number format
            const formattedData = {
                ...data,
                invoiceDate,
                symbolCurrency,
                partnerAddress: cleanAddress(data.partnerAddress || ''),
                billToAddress: cleanAddress(data.billToAddress || ''),
                s: data?.s?.map((item: any) => ({
                    ...item,
                    description: item.description?.trim(),
                    amount: Number(item.amount || 0).toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                })),
                total: total.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                signatureImage,
                routingNumber: data.routingNumber || undefined,
                taxId: data.taxId || undefined,
                po: data.po || undefined,
                accountType: data.accountType || undefined,
                bankAddress: data.bankAddress
                    ? cleanAddress(data.bankAddress || '')
                    : undefined,
            };

            generateDocument({
                data: formattedData,
                readUrl: '/preview/template.docx',
                onPreview(blobUrl: string) {
                    setLinkPreview(blobUrl);
                },
                // onDownload: (blob: Blob) => {
                //   const timestamp = Date.now();
                //   const newFilename = `${data.invoiceNumber || 'unknown'}-${timestamp}.docx`;
                //   downloadBlob(blob, newFilename);
                // },
            });
        };

        // Only use canvas signature if draw tab is active
        if (activeTab === 'draw') {
            signatureImage = getCurrentDrawSignature();
        } else if (
            activeTab === 'upload' &&
            data.signatureUpload &&
            data.signatureUpload?.fileList?.length > 0
        ) {
            // Convert file to base64 for Word document
            const currentUpload = data.signatureUpload.fileList[0];
            const file = currentUpload.originFileObj;
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    generateDocWithSignature(base64String);
                };
                reader.readAsDataURL(file);
                return; // Exit early, will continue in onload callback
            }

            if (currentUpload.url || currentUpload.preview) {
                generateDocWithSignature(
                    currentUpload.url || currentUpload.preview
                );
                return;
            }
        }

        generateDocWithSignature(signatureImage);
    }, [activeTab, form, getCurrentDrawSignature]);

    const clearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            form.setFieldValue('signatureCanvas', '');
            handlePreview();
        }
    };

    const saveSignature = () => {
        const signatureData = getCurrentDrawSignature();
        if (signatureData) {
            form.setFieldValue('signatureCanvas', signatureData);
            handlePreview();
        }
    };

    const handleDownloadWord = async () => {
        try {
            // Validate form first
            await form.validateFields();

            // Custom validation for SWIFT/Routing number
            const data = form.getFieldsValue();

            // Get invoice number from form
            // const invoiceNumber = data.invoiceNumber || 'unknown';
            // const timestamp = Date.now();
            // const filename = `${invoiceNumber}-${timestamp}.docx`;

            const partnerName = data.partnerName;
            const billToName = data.billToName;

            // const timestamp = Date.now();
            const filename = `${partnerName} - ${billToName}`;

            if (linkPreview === '/preview/template.docx') {
                // Fetch and download the original template file
                const response = await fetch(linkPreview);
                const blob = await response.blob();
                downloadBlob(blob, filename);
            } else {
                // Fetch and download the preview blob
                const response = await fetch(linkPreview);
                const blob = await response.blob();
                downloadBlob(blob, filename);
            }
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            // Validate form first
            await form.validateFields();

            // Custom validation for SWIFT/Routing number
            const data = form.getFieldsValue();

            // Get invoice number from form
            // const invoiceNumber = data.invoiceNumber || 'unknown';
            const partnerName = data.partnerName;
            const billToName = data.billToName;

            // const timestamp = Date.now();
            const filename = `${partnerName} - ${billToName}`;

            // Fetch the current preview blob
            const response = await fetch(linkPreview);
            const blob = await response.blob();

            // Convert blob to File
            const file = new File([blob], `${filename}.docx`, {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            // Convert to PDF using the hook
            const pdfResponse = await convertToPdf({ file });
            const pdfBlob = pdfResponse.data;

            // Download the PDF
            downloadBlob(pdfBlob, `${filename}.pdf`);
        } catch (error) {
            if (error instanceof Error && error.name === 'ValidationError') {
                console.error('Form validation failed:', error);
            } else {
                console.error('Error converting to PDF:', error);
            }
        }
    };

    const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleExportFormData = async () => {
        try {
            const data = form.getFieldsValue(true);
            let signatureUploadBase64 = '';
            const signatureCanvas =
                activeTab === 'draw'
                    ? getCurrentDrawSignature()
                    : data.signatureCanvas || '';

            const uploadFile =
                data.signatureUpload?.fileList?.[0]?.originFileObj;
            if (uploadFile instanceof File) {
                signatureUploadBase64 = await fileToBase64(uploadFile);
            } else if (data.signatureUploadBase64) {
                signatureUploadBase64 = data.signatureUploadBase64;
            }

            const exportPayload = {
                version: 1,
                type: 'ant-invoice-form',
                exportedAt: new Date().toISOString(),
                data: {
                    ...data,
                    invoiceDate: data.invoiceDate
                        ? dayjs(data.invoiceDate).format(DATE_FORMAT.DATE_ONLY)
                        : null,
                    activeTab,
                    signatureCanvas,
                    signatureUploadBase64,
                    signatureUpload: undefined,
                },
            };

            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
                type: 'application/json',
            });
            const filename = `${data.invoiceNumber || 'invoice'}-profile.json`;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error('Error exporting form data:', error);
        }
    };

    const handleImportButtonClick = () => {
        importInputRef.current?.click();
    };

    const handleImportFormData = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const fileText = await file.text();
            const parsed = JSON.parse(fileText);

            if (parsed?.type !== 'ant-invoice-form' || !parsed?.data) {
                throw new Error('Invalid import file format');
            }

            const importedData = parsed.data;
            const restoredUpload =
                importedData.signatureUploadBase64 &&
                importedData.activeTab === 'upload'
                    ? {
                          fileList: [
                              {
                                  uid: '-1',
                                  name: 'signature-imported.png',
                                  status: 'done',
                                  url: importedData.signatureUploadBase64,
                              },
                          ],
                      }
                    : undefined;

            form.resetFields();

            if (signatureRef.current) {
                signatureRef.current.clear();
            }

            form.setFieldsValue({
                ...importedData,
                invoiceDate: importedData.invoiceDate
                    ? dayjs(importedData.invoiceDate, DATE_FORMAT.DATE_ONLY)
                    : null,
                signatureUpload: restoredUpload,
            });

            if (importedData.invoiceNumber) {
                setInvoiceNumber(importedData.invoiceNumber);
            }

            setActiveTab(importedData.activeTab || 'draw');
            setPendingSignatureCanvas(
                importedData.activeTab === 'draw'
                    ? importedData.signatureCanvas || ''
                    : ''
            );
            setShouldRefreshPreviewAfterImport(true);
        } catch (error) {
            console.error('Error importing form data:', error);
        } finally {
            event.target.value = '';
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            invoiceNumber,
        });
    }, [form, invoiceNumber]);

    useEffect(() => {
        if (
            activeTab !== 'draw' ||
            !pendingSignatureCanvas ||
            !signatureRef.current
        ) {
            return;
        }

        const canvas = signatureRef.current.getCanvas();
        const ctx = canvas.getContext('2d');
        const image = new Image();

        image.onload = () => {
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
            form.setFieldValue('signatureCanvas', pendingSignatureCanvas);
            setPendingSignatureCanvas('');
            setTimeout(() => handlePreview(), 0);
        };

        image.src = pendingSignatureCanvas;
    }, [activeTab, form, handlePreview, pendingSignatureCanvas]);

    useEffect(() => {
        if (!shouldRefreshPreviewAfterImport) {
            return;
        }

        if (activeTab === 'draw' && pendingSignatureCanvas) {
            return;
        }

        setShouldRefreshPreviewAfterImport(false);
        setTimeout(() => handlePreview(), 0);
    }, [activeTab, handlePreview, pendingSignatureCanvas, shouldRefreshPreviewAfterImport]);

    const downloadMenuItems = [
        {
            key: 'word',
            label: 'Download Word',
            icon: <FileWordOutlined />,
            onClick: handleDownloadWord,
        },
    ];

    // Update invoice number when invoice date changes
    const handleInvoiceDateChange = (date: any) => {
        if (date) {
            const selectedDate = date.toDate(); // Convert dayjs to Date
            const newInvoiceNumber = generateRandomSuffix(selectedDate);
            setInvoiceNumber(newInvoiceNumber);
            form.setFieldsValue({ invoiceNumber: newInvoiceNumber });
            setTimeout(() => handlePreview(), 0);
        }
    };

    return (
        <div className="h-screen p-4">
            <div className="mx-auto" style={{ maxWidth: '1920px' }}>
                {/* <Button type="primary" onClick={() => setLinkPreview("/preview/template.docx")}>Sample</Button> */}
                <Row
                    gutter={16}
                    className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)]"
                >
                    <Col
                        xs={24}
                        lg={12}
                        xl={12}
                        className="h-auto lg:h-full"
                        style={{ overflowY: 'auto' }}
                    >
                        <AppForm
                            size="small"
                            form={form}
                            layout="horizontal"
                            onFinish={onFinish}
                            style={{ width: '100%' }}
                            className="space-y-5"
                            showSubmit={false}
                            initialValues={{
                                billToName: COMPANY_NAME,
                                billToAddress: COMPANY_ADDRESS,
                                billToTaxId: TAX_ID,
                                billToCompany: COMPANY_ID,
                                invoiceDate: dayjs(),
                                currency: 'USD',
                                s: [
                                    {
                                        description: 'Revenue Youtube MM/YYYY',
                                        amount: 0,
                                    },
                                ],
                            }}
                            onValuesChange={() => handlePreview()}
                        >
                            {/* Invoice Information */}
                            <InvoiceInfoSection
                                invoiceNumber={invoiceNumber}
                                handleInvoiceDateChange={
                                    handleInvoiceDateChange
                                }
                                handleReloadInvoice={handleReloadInvoice}
                                handleExportFormData={handleExportFormData}
                                handleImportButtonClick={
                                    handleImportButtonClick
                                }
                                currencyOptions={currencyOptions}
                            />

                            <Row gutter={16} className="gap-y-5">
                                {/* Partner information */}
                                <Col xs={24} lg={12}>
                                    <PartnerInfoSection />
                                </Col>

                                {/* test */}
                                {/* Bill to */}
                                <Col xs={24} lg={12}>
                                    <BillToSection />
                                </Col>
                            </Row>

                            {/* Payment Content */}
                            <PaymentItemsSection />

                            <Row gutter={16} className="gap-y-5">
                                <Col xs={24} sm={24} md={24} lg={14} span={14}>
                                    <BankInfoSection />
                                </Col>

                                {/* Digital Signature */}
                                <Col xs={24} sm={24} md={24} lg={10} span={10}>
                                    <SignatureSection
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                        signatureRef={signatureRef}
                                        clearSignature={clearSignature}
                                        saveSignature={saveSignature}
                                    />
                                </Col>
                            </Row>
                        </AppForm>
                    </Col>

                    <Col
                        xs={24}
                        lg={12}
                        xl={12}
                        className="h-auto lg:h-full"
                        style={{ overflow: 'hidden' }}
                    >
                        <Card
                            size="small"
                            title={
                                <div className="flex flex-wrap justify-between gap-2 py-2">
                                    <span>Document Preview</span>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="small"
                                            icon={
                                                <div>
                                                    <Eye size={16} />
                                                </div>
                                            }
                                            type="primary"
                                            onClick={() => handlePreview()}
                                        >
                                            {' '}
                                            Preview
                                        </Button>
                                        <input
                                            ref={importInputRef}
                                            type="file"
                                            accept=".json"
                                            onChange={handleImportFormData}
                                            hidden
                                        />
                                        <Space.Compact>
                                            <Button
                                                size="small"
                                                loading={isPending}
                                                icon={<FilePdfOutlined />}
                                                type="primary"
                                                onClick={handleDownloadPdf}
                                            >
                                                Download PDF
                                            </Button>
                                            <Dropdown
                                                menu={{
                                                    items: downloadMenuItems,
                                                }}
                                            >
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<DownOutlined />}
                                                />
                                            </Dropdown>
                                        </Space.Compact>
                                    </div>
                                </div>
                            }
                            style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '6px',
                                    height: 'auto',
                                    overflow: 'auto',
                                }}
                                className="lg:h-[90vh]!"
                            >
                                <DocxViewer filePath={linkPreview} />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

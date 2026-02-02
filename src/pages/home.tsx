import { useState, useEffect, useRef } from 'react';
import { Form, Input, Card, Row, Col, Button, DatePicker, InputNumber, Tabs, Select, Divider, Dropdown, Space } from 'antd';
import { PlusOutlined, FilePdfOutlined, FileWordOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DocxViewer from '../modules/invoice/components/docx-preview';
import type { FormProps } from 'antd';
import AppForm from '../components/UI/antd-form/form';
import AppFormItem from '../components/UI/antd-form/form-Item';
import { generateDocument, downloadBlob } from '../modules/invoice/helpers';
import { formattedDate} from '../common/helpers/date';
import { DATE_FORMAT } from '../common/enums/common';
import {  Eye, Trash } from 'lucide-react';
import { COMPANY_ADDRESS, COMPANY_ID, COMPANY_NAME, TAX_ID } from '../modules/invoice/constants';
import { useConvertWordToPdf } from '../modules/invoice/hooks/use-convert-word-to-pdf';
import SignatureCanvas from 'react-signature-canvas';
import ImageListUpload from '../components/UI/upload/image-list-upload';
import TextArea from 'antd/es/input/TextArea';

const generateRandomSuffix = (date?: Date) => {
  const targetDate = date || new Date();
  const dateStr = targetDate.getFullYear().toString() + 
                 (targetDate.getMonth() + 1).toString().padStart(2, '0') + 
                 targetDate.getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${randomNum}`;
};

export default function Home() {
  const [form] = Form.useForm();
  const [invoiceNumber, setInvoiceNumber] = useState(generateRandomSuffix());
  const [linkPreview, setLinkPreview] = useState<string>("/preview/template-user.docx");
  const [activeTab, setActiveTab] = useState<string>('draw');
  const { convertToPdf, isPending } = useConvertWordToPdf();
  const signatureRef = useRef<SignatureCanvas>(null);

  const currencyOptions = [
    { value: 'EUR', label: 'EUR (€)', locale: 'de-DE', symbol: '€' },
    { value: 'USD', label: 'USD ($)', locale: 'en-US', symbol: '$' },
    { value: 'GBP', label: 'GBP (£)', locale: 'en-GB', symbol: '£' },
    { value: 'SGD', label: 'SGD (S$)', locale: 'en-SG', symbol: 'S$' },
    { value: 'HKD', label: 'HKD (HK$)', locale: 'zh-HK', symbol: 'HK$' },
    { value: 'CNY', label: 'CNY (¥)', locale: 'zh-CN', symbol: '¥' },
    { value: 'VND', label: 'VND (₫)', locale: 'vi-VN', symbol: '₫' }
  ]

  // const handleReloadInvoice = () => {
  //   // Get current invoice date from form, fallback to today
  //   const formData = form.getFieldsValue();
  //   const invoiceDate = formData.invoiceDate ? formData.invoiceDate.toDate() : new Date();
  //   const newInvoiceNumber = generateRandomSuffix(invoiceDate);
  //   setInvoiceNumber(newInvoiceNumber);
  //   form.setFieldValue('invoiceNumber', newInvoiceNumber);
  // };


  const onFinish: FormProps['onFinish'] = (values) => {
    console.log('Form values:', values);
  };

  const handlePreview = () => {
      const data = form.getFieldsValue();
      const invoiceDate = formattedDate(data.invoiceDate, DATE_FORMAT.DATE_ONLY);
      const total = data?.s?.reduce((acc: number, s: any) => acc + Number(s.amount || 0), 0);
      // Get currency symbol
      const selectedCurrency = currencyOptions.find(option => option.value === data.currency);
      const symbolCurrency = selectedCurrency?.symbol || '';
      
       // Get signature data - prioritize uploaded image over canvas signature
      let signatureImage = '';

      const generateDocWithSignature = (signatureImage: string) => {
        // Get locale from selected currency
        const selectedCurrency = currencyOptions.find(option => option.value === data.currency);
        const locale = selectedCurrency?.locale || 'en-US';
        
        // Helper function to clean address fields
        const cleanAddress = (address: string) => {
          if (!address) return '';
          const trimmed = address.trim();
          // Remove lines that are empty or contain only whitespace
          const lines = trimmed.split('\n').filter(line => line.trim().length > 0);
          return lines.join('\n');
        };

        // Format amount fields with currency-specific number format
        const formattedData = {
          ...data,
          invoiceDate,
          symbolCurrency,
          partnerAddress: cleanAddress(data.partnerAddress || ''),
          billToAddress: cleanAddress(data.billToAddress || ''),
          bankAddress: cleanAddress(data.bankAddress || ''),
          s: data?.s?.map((item: any) => ({
            ...item,
            description: item.description?.trim(),
            amount: Number(item.amount || 0).toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          })),
          total: total.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          signatureImage,
        };
        
        generateDocument({
          data: formattedData,
          readUrl: "/preview/template.docx",
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
      if (activeTab === 'draw' && signatureRef.current && !signatureRef.current.isEmpty()) {
        signatureImage = signatureRef.current.toDataURL();
      } else if(activeTab === 'upload' && data.signatureUpload && data.signatureUpload?.fileList?.length > 0) {
         // Convert file to base64 for Word document
        const file = data.signatureUpload.fileList[0].originFileObj;
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            generateDocWithSignature(base64String);
          };
          reader.readAsDataURL(file);
          return; // Exit early, will continue in onload callback
        }
      }

      generateDocWithSignature(signatureImage);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      form.setFieldValue('signatureCanvas', '');
      handlePreview();
    }
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      form.setFieldValue('signatureCanvas', signatureData);
      handlePreview();
    }
  };



  const handleDownloadWord = async () => {
    try {
      // Validate form first
      await form.validateFields();
      
      // Get invoice number from form
      const data = form.getFieldsValue();
      // const invoiceNumber = data.invoiceNumber || 'unknown';
      // const timestamp = Date.now();
      // const filename = `${invoiceNumber}-${timestamp}.docx`;

         const partnerName = data.partnerName;
      const billToName = data.billToName;

      // const timestamp = Date.now();
      const filename = `${partnerName} - ${billToName}`;
      
      if (linkPreview === "/preview/template.docx") {
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
      
      // Get invoice number from form
      const data = form.getFieldsValue();
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
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
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

  useEffect(() => {
    form.setFieldsValue({
      invoiceNumber,
    });
  }, [form, invoiceNumber]);

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
      form.setFieldValue('invoiceNumber', newInvoiceNumber);
    }
  };


  return (
    <div className='h-screen p-4'>
      <div className="mx-auto" style={{ maxWidth: '1920px' }}>
        {/* <Button type="primary" onClick={() => setLinkPreview("/preview/template.docx")}>Sample</Button> */}
        <Row gutter={16} className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)]" >
        <Col xs={24} lg={12} xl={12} className="h-auto lg:h-full" style={{ overflowY: 'auto' }}>
          <AppForm
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
              s: [{ description: '', amount: 0 }],
            }}
          >
          {/* Invoice Information */}
          <Card size='small' title="Invoice Information" className='mb-4!'>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <AppFormItem
                  label="Date"
                  name="invoiceDate"
                  layout='vertical'
                  required
                  wrapperCol={{ span: 24 }}
                  labelCol={{ span: 24 }}
                  rules={[{ required: true, message: 'Please select date!' }]}
                >
                  <DatePicker format={DATE_FORMAT.DATE_ONLY} style={{ width: '100%' }} onChange={handleInvoiceDateChange} />
                </AppFormItem>
              </Col>
              <Col xs={24} md={10}>
                <AppFormItem
                  label="Invoice No."
                  name="invoiceNumber"
                  layout='vertical'
                  labelCol={{span:24}}
                  wrapperCol={{ span: 24 }}
                  rules={[{ required: true, message: 'Please input invoice number!' }]}
                  required
                >
                  <Input 
                    readOnly
                    value={invoiceNumber}
                    placeholder="Invoice number will auto-generate"
                  />
                </AppFormItem>
              </Col>
              <Col xs={24} md={6}>
                <AppFormItem
                  label="Currency"
                  name="currency"
                  layout='vertical'
                  wrapperCol={{ span: 24 }}
                  labelCol={{span:24}}
                  rules={[{ required: true, message: 'Please input currency!' }]}
                  required
                >
                  <Select
                    placeholder="Select currency"
                    options={currencyOptions}
                    style={{ width: '100%' }}
                  />
                </AppFormItem>
              </Col>
            </Row>
              
          </Card>

         <Row gutter={16} className="gap-y-5">
              {/* Partner information */}
            <Col xs={24} lg={12}>
            <Card size='small' title="Partner information" style={{  height: '100%' }}>
              <AppFormItem
                label="Name"
                wrapperCol={{ span: 24 }}
                name="partnerName"
                required
                rules={[{ required: true, message: 'Please input name!' }]}
              >
                <Input placeholder="Enter name" />
              </AppFormItem>
              <AppFormItem
                label="Address"
                wrapperCol={{ span: 24 }}
                name="partnerAddress"
                required
                rules={[{ required: true, message: 'Please input address!' }]}
              >
                <TextArea placeholder="Enter address" autoSize={{ minRows: 1, maxRows: 5 }} />
              </AppFormItem>
              <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Zip Code"
                name="partnerZipCode"
                required
                rules={[{ required: true, message: 'Please input zip code!' }]}
              >
                <Input placeholder="Enter zip code" />
              </AppFormItem>
              <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Email"
                name="partnerEmail"
                required
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input placeholder="Enter email" />
              </AppFormItem>
            </Card>
            </Col>


            {/* Bill to */}
            <Col xs={24} lg={12}>
            <Card size='small' title="Bill to" >
              <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Name"
                name="billToName"
                required
                rules={[{ required: true, message: 'Please input name!' }]}
              >
                <Input placeholder="Enter name" />
              </AppFormItem>
              <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Company"
                name="billToCompany"
                required
                rules={[{ required: true, message: 'Please input company!' }]}
              >
                <Input placeholder="Enter company" />
              </AppFormItem>
              <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Tax ID"
                name="billToTaxId"
                required
                rules={[{ required: true, message: 'Please input tax ID!' }]}
              >
                <Input placeholder="Enter tax ID" />
              </AppFormItem>
              <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Address"
                name="billToAddress"
                required
                rules={[{ required: true, message: 'Please input address!' }]}
              >
                <TextArea autoSize={{
                  minRows:1,
                  maxRows:5
                }} placeholder="Enter address" />
              </AppFormItem>
               <AppFormItem
                wrapperCol={{ span: 24 }}
                label="PO"
                name="po"
               
              >
                <Input placeholder="Enter PO" />
              </AppFormItem>
            </Card>
            </Col>
         </Row>

    

          {/* Payment Content */}
          <Card size='small' title="Payment Details" className='mb-5!'>
            {/* Header */}
            <div className='border rounded-md p-2 sm:p-4 border-zinc-200'>
              <Row gutter={[8, 8]} align="middle" style={{ 
              padding: '8px 0',
              backgroundColor: '#fafafa',
              margin: '0 0 12px',
            }}>
                <Col xs={12} sm={10} md={16}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Description</span>
                </Col>
                <Col xs={8} sm={6} md={6}>
                  <span style={{ fontWeight: 600, textAlign: 'left', display: 'block', padding: '0 4px', fontSize: '14px' }}>Amount</span>
                </Col>
                <Col xs={4} sm={8} md={2}>
                  <span style={{ fontWeight: 600, textAlign: 'center', display: 'block', fontSize: '14px' }}></span>
                </Col>
            </Row>
            
            <Form.List name="s">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} >
                      <Row gutter={[8, 8]} align="top" >
                        <Col xs={24} sm={10} md={16} >
                          <AppFormItem
                            {...restField}
                            name={[name, 'description']}
                            required
                            rules={[{ required: true, message: 'Please input description!' }]}
                            colon={false}
                            labelCol={{ span: 0 }}
                            wrapperCol={{ span: 24 }}
                          >
                            <Input.TextArea autoSize={{
                                minRows:1,
                                maxRows:5
                            }} placeholder="Enter description" style={{ width: '100%', fontSize: '14px' }} />
                          </AppFormItem>
                        </Col>
                        <Col xs={20} sm={6} md={6} >
                          <AppFormItem
                            {...restField}
                            name={[name, 'amount']}
                            label=""
                            required
                            rules={[{ required: true, message: 'Please input amount!' }]}
                            colon={false}
                            labelCol={{ span: 0 }}
                            wrapperCol={{ span: 24 }}
                          >
                            <InputNumber 
                              placeholder="0.00"
                              style={{ width: '100%', fontSize: '14px' }}
                              min={0}
                              precision={2}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                          </AppFormItem>
                        </Col>
                        <Col xs={4} sm={8} md={2} className="flex items-center ">
                          <Button 
                            type="default" 
                            shape='default'
                            danger 
                            icon={<Trash size={16} />} 
                            onClick={() => remove(name)}
                            size="middle"
                          />
                        </Col>
                      </Row>
                      <div className="sm:hidden">
                        <Divider />
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                    style={{
                      width:'100%',
                    }}
                  >
                    Add Item
                  </Button>
                </>
              )}
            </Form.List>
            </div>
          </Card>

          <Row gutter={16} className="gap-y-5">
            <Col xs={24} sm={24} md={24} lg={14} span={14}>
              <Card size='small' title="Payment information" style={{ height:'100%' }}  >
            <AppFormItem
            
              label="Account name"
              name="accountName"
              required
              rules={[{ required: true, message: 'Please input account name!' }]}
            >
              <Input placeholder="Enter account name" />
            </AppFormItem>
            <AppFormItem
              label="Bank name"
              name="bankName"
              required
              rules={[{ required: true, message: 'Please input bank name!' }]}
            >
              <Input placeholder="Enter bank name" />
            </AppFormItem>
            <AppFormItem
              label="Account number"
              name="accountNumber"
              required
              rules={[{ required: true, message: 'Please input account number!' }]}
            >
              <Input placeholder="Enter account number" />
            </AppFormItem>
            <AppFormItem
              label="SWIFT code"
              name="swiftCode"
              // required
              // rules={[{ required: true, message: 'Please input SWIFT code!' }]}
            >
              <Input placeholder="Enter SWIFT code" />
            </AppFormItem>
            <AppFormItem
              label="Address"
              name="bankAddress"
              
            >
              <TextArea autoSize={{
                minRows:1,
                maxRows:5
              }} placeholder="Enter address" />
            </AppFormItem>
          </Card>
            </Col>

          {/* Digital Signature */}
              <Col xs={24} sm={24} md={24} lg={10} span={10}>
                <Card size='small' title="Digital Signature" >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                 {
                  key: 'draw',
                  label: 'Draw Signature',
                  children: (
                    <AppFormItem
                      label=""
                      name="signatureCanvas"
                      labelCol={{
                        span:24
                      }}
                      wrapperCol={{
                        span:24
                      }}
                    >
                      <div>
                            <SignatureCanvas
                              ref={signatureRef}
                              penColor="black"
                              canvasProps={{
                                className: 'signature-canvas',
                                style: { 
                                  border: '1px dashed #ccc',
                                  width: '100%',
                                  maxWidth: '100%',
                                  height: '150px'
                                }
                              }}
                            />
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <Button onClick={clearSignature}>Clear</Button>
                          <Button type="primary" onClick={saveSignature}>Save Signature</Button>
                        </div>
                      </div>
                    </AppFormItem>
                  )
                },
                {
                  key: 'upload',
                  label: 'Upload Signature',
                  children: (
                    <AppFormItem  
                      label=""
                      name="signatureUpload">
                        <ImageListUpload maxCount={1} />
                    </AppFormItem>
                  )
                }
              ]}
            />
          </Card>
              </Col>
          </Row>
        </AppForm>
        </Col>
        
        <Col xs={24} lg={12} xl={12} className="h-auto lg:h-full" style={{ overflow: 'hidden' }}>
          <Card size='small'  title={
            <div className='flex justify-between flex-wrap gap-2 py-2'>
              <span>Document Preview</span>
              <div className='flex gap-2 flex-wrap' >
                <Button size='small' icon={<div><Eye size={16}  /></div>} type="primary" onClick={() => handlePreview()}> Preview</Button>
                <Space.Compact>
                  <Button size='small' loading={isPending} icon={<FilePdfOutlined />} type="primary" onClick={handleDownloadPdf}>Download PDF</Button>
                  <Dropdown menu={{ items: downloadMenuItems }}>
                    <Button type='primary' size='small' icon={<DownOutlined />} />
                  </Dropdown>
                </Space.Compact>
              </div>
          </div>
          } 
         style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '6px', height: 'auto', overflow: 'auto' }} className="lg:h-[90vh]!">
              <DocxViewer  filePath={linkPreview} />
            </div>
          </Card>
        </Col>
      </Row>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Form, Input, Card, Row, Col, Button, DatePicker, InputNumber, Tabs } from 'antd';
import { PlusOutlined, FileWordOutlined, FilePdfOutlined,  } from '@ant-design/icons';
import dayjs from 'dayjs';
import DocxViewer from '../modules/invoice/components/docx-preview';
import type { FormProps } from 'antd';
import AppForm from '../components/UI/antd-form/form';
import AppFormItem from '../components/UI/antd-form/form-Item';
import { generateDocument, downloadBlob } from '../modules/invoice/helpers';
import { formattedDate} from '../common/helpers/date';
import { DATE_FORMAT } from '../common/enums/common';
import {  Eye, RotateCw, Trash } from 'lucide-react';
import { COMPANY_ADDRESS, COMPANY_ID, COMPANY_NAME, TAX_ID } from '../modules/invoice/constants';
import { useConvertWordToPdf } from '../modules/invoice/hooks/use-convert-word-to-pdf';
import SignatureCanvas from 'react-signature-canvas';
import ImageListUpload from '../components/UI/upload/image-list-upload';

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
  const [activeTab, setActiveTab] = useState<string>('upload');
  const { convertToPdf, isPending } = useConvertWordToPdf();
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleReloadInvoice = () => {
    const newInvoiceNumber = generateRandomSuffix();
    setInvoiceNumber(newInvoiceNumber);
    form.setFieldValue('invoiceNumber', newInvoiceNumber);
  };


  const onFinish: FormProps['onFinish'] = (values) => {
    console.log('Form values:', values);
  };

  const handlePreview = () => {
      const data = form.getFieldsValue();
      const invoiceDate = formattedDate(data.invoiceDate, DATE_FORMAT.DATE_ONLY);
      const total = data?.s?.reduce((acc: number, s: any) => acc + Number(s.amount || 0), 0);
      
       // Get signature data - prioritize uploaded image over canvas signature
      let signatureImage = '';

      const generateDocWithSignature = (signatureImage: string) => {
        // Format amount fields with international number format
        const formattedData = {
          ...data,
          invoiceDate,
          s: data?.s?.map((item: any) => ({
            ...item,
            amount: Number(item.amount || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          })),
          total: total.toLocaleString('en-US', {
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
      
      // Generate filename with today's date and timestamp using dayjs
      const now = dayjs();
      const date = formattedDate(now, DATE_FORMAT.DATE_ONLY)
      const timestamp = now.valueOf();
      const filename = `Invoice-${date}-${timestamp}.docx`;
      
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
      
      // Generate filename with today's date and timestamp using dayjs
      const now = dayjs();
      const date = formattedDate(now, DATE_FORMAT.DATE_ONLY)
      const timestamp = now.valueOf();
      const filename = `Invoice-${date}-${timestamp}`;
      
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
        {/* <Button type="primary" onClick={() => setLinkPreview("/preview/template.docx")}>Sample</Button> */}
      <Row gutter={16} className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)]" >
        <Col xs={24} lg={12} className="h-auto lg:h-full" style={{ overflowY: 'auto' }}>
          <AppForm
            form={form}
            layout="horizontal"
            onFinish={onFinish}
            style={{ width: '100%' }}
            showSubmit={false}
            initialValues={{
              billToName: COMPANY_NAME,
              billToAddress: COMPANY_ADDRESS,
              billToTaxId: TAX_ID,
              billToCompany: COMPANY_ID,
              invoiceDate: dayjs(),
              s: [{ description: '', amount: 0 }],
            }}
          >
          {/* Invoice Information */}
          <Card title="Invoice Information" style={{ marginBottom: '24px' }}>
            <AppFormItem
              label="Date"
              name="invoiceDate"
              required
              rules={[{ required: true, message: 'Please select date!' }]}
            >
              <DatePicker style={{ width: '100%' }} onChange={handleInvoiceDateChange} />
            </AppFormItem>
            <AppFormItem
              label="Invoice No."
              name="invoiceNumber"
              rules={[{ required: true, message: 'Please input invoice number!' }]}
              required
            >
              <Input 
                placeholder="Enter invoice number"
                addonAfter={
                  <Button 
                    type="text" 
                    icon={<RotateCw size={16} />} 
                    onClick={handleReloadInvoice}
                    title="Generate new invoice number"
                    size='small'
                  />
                }
              />
            </AppFormItem>
          </Card>

          {/* Partner information */}
          <Card title="Partner information" style={{ marginBottom: '24px' }}>
            <AppFormItem
              label="Name"
              name="partnerName"
              required
              rules={[{ required: true, message: 'Please input name!' }]}
            >
              <Input placeholder="Enter name" />
            </AppFormItem>
            <AppFormItem
              label="Address"
              name="partnerAddress"
              required
              rules={[{ required: true, message: 'Please input address!' }]}
            >
              <Input placeholder="Enter address" />
            </AppFormItem>
            <AppFormItem
              label="Zip Code"
              name="partnerZipCode"
              required
              rules={[{ required: true, message: 'Please input zip code!' }]}
            >
              <Input placeholder="Enter zip code" />
            </AppFormItem>
            <AppFormItem
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


          {/* Bill to */}
          <Card title="Bill to" style={{ marginBottom: '24px' }}>
            <AppFormItem
              label="Name"
              name="billToName"
              required
              rules={[{ required: true, message: 'Please input name!' }]}
            >
              <Input placeholder="Enter name" />
            </AppFormItem>
            <AppFormItem
              label="Company"
              name="billToCompany"
              required
              rules={[{ required: true, message: 'Please input company!' }]}
            >
              <Input placeholder="Enter company" />
            </AppFormItem>
            <AppFormItem
              label="Tax ID"
              name="billToTaxId"
              required
              rules={[{ required: true, message: 'Please input tax ID!' }]}
            >
              <Input placeholder="Enter tax ID" />
            </AppFormItem>
            <AppFormItem
              label="Address"
              name="billToAddress"
              required
              rules={[{ required: true, message: 'Please input address!' }]}
            >
              <Input placeholder="Enter address" />
            </AppFormItem>
          </Card>

    

          {/* Payment Content */}
          <Card title="Payment Details" style={{ marginBottom: '24px' }}>
            {/* Header */}
            <div className='border rounded-md p-4 border-zinc-200'>
              <Row gutter={16} align="middle" style={{ 
              padding: '12px 12px',
              backgroundColor: '#fafafa',
              margin: '0 0 12px'
             
            }}>
              <Col xs={24} sm={12} md={14}>
                <span style={{ fontWeight: 600 }}>Description</span>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <span style={{ fontWeight: 600, textAlign: 'center', display: 'block' }}>Amount</span>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <span style={{ fontWeight: 600, textAlign: 'center', display: 'block' }}>Action</span>
              </Col>
            </Row>
            
            <Form.List name="s">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} >
                      <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={14} >
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
                            }} placeholder="Enter description" style={{ width: '100%' }} />
                          </AppFormItem>
                        </Col>
                        <Col xs={24} sm={8} md={6} >
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
                              style={{ width: '100%' }}
                              min={0}
                              precision={2}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                          </AppFormItem>
                        </Col>
                        <Col xs={24} sm={4} md={4} className="text-center">
                          <Button 
                            type="text" 
                            shape='circle'
                            danger 
                            icon={<Trash size={16} />} 
                            onClick={() => remove(name)}
                            className='mb-2'
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                    style={{
                      width:'100%'
                    }}
                  >
                    Add Item
                  </Button>
                </>
              )}
            </Form.List>
            </div>
          </Card>

          <Card title="Payment information" style={{ marginBottom: '24px' }}>
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
              label="Account number Bank"
              name="accountNumber"
              // required
              // rules={[{ required: true, message: 'Please input account number!' }]}
            >
              <Input placeholder="Enter account number" />
            </AppFormItem>
            <AppFormItem
              label="SWIFT code Bank"
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
              <Input placeholder="Enter address" />
            </AppFormItem>
          </Card>

          {/* Digital Signature */}
          <Card title="Digital Signature" style={{ marginBottom: '24px' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                 {
                  key: 'draw',
                  label: 'Draw Signature',
                  children: (
                    <AppFormItem
                      label="Draw Your Signature"
                      name="signatureCanvas"
                    >
                      <div>
                        <SignatureCanvas
                          ref={signatureRef}
                          penColor="black"
                          canvasProps={{
                            width: window.innerWidth < 768 ? window.innerWidth - 80 : 400,
                            height: 150,
                            className: 'signature-canvas',
                            style: { border: '1px dashed #ccc', width: '100%', maxWidth: '400px' }
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
                      label="Upload Signature"
                      name="signatureUpload">
                        <ImageListUpload maxCount={1} />
                    </AppFormItem>
                  )
                }
              ]}
            />
          </Card>
        </AppForm>
        </Col>
        
        <Col xs={24} lg={12} className="h-auto lg:h-full" style={{ overflow: 'hidden' }}>
          <Card  title={
            <div className='flex justify-between flex-wrap gap-2 py-2'>
              <span>Document Preview</span>
              <div className='flex gap-2 flex-wrap' >
                <Button icon={<div><Eye size={16}  /></div>} type="primary" onClick={() => handlePreview()}> Preview</Button>
                <Button icon={<FileWordOutlined />} type="primary" onClick={handleDownloadWord}>Download Word</Button>
                <Button loading={isPending} icon={<FilePdfOutlined />} type="primary" onClick={handleDownloadPdf}>Download PDF</Button>
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
  );
}

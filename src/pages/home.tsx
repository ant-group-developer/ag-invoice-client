import { useState, useEffect, useRef } from 'react';
import { Form, Input, Card, Row, Col, Button, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, MinusCircleOutlined, FileWordOutlined, FilePdfOutlined, EyeOutlined,  } from '@ant-design/icons';
import DocxViewer from '../modules/invoice/components/docx-preview';
import type { FormProps } from 'antd';
import AppForm from '../components/UI/antd-form/form';
import AppFormItem from '../components/UI/antd-form/form-Item';
import { generateDocument, downloadBlob } from '../modules/invoice/helpers';
import { formattedDate } from '../common/helpers/date';
import { DATE_FORMAT } from '../common/enums/common';
import {  RotateCw } from 'lucide-react';
import { COMPANY_ADDRESS, COMPANY_ID, COMPANY_NAME, TAX_ID } from '../modules/invoice/constants';
import { useConvertWordToPdf } from '../modules/invoice/hooks/use-convert-word-to-pdf';
import SignatureCanvas from 'react-signature-canvas';

const generateRandomSuffix = () => {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
                 (today.getMonth() + 1).toString().padStart(2, '0') + 
                 today.getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${randomNum}`;
};

export default function Home() {
  const [form] = Form.useForm();
  const [invoiceNumber, setInvoiceNumber] = useState(generateRandomSuffix());
  const [linkPreview, setLinkPreview] = useState("/preview/template-user.docx");
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
      
      // Get signature data if canvas exists
      let signatureData = '';
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        signatureData = signatureRef.current.toDataURL();
      }
      
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
        signatureImage: signatureData,
      };
      
       generateDocument({
            data: formattedData,
            readUrl: "/preview/template.docx",
            onPreview(blobUrl) {
                setLinkPreview(blobUrl);
            },
        });
    
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      form.setFieldValue('signatureImage', '');
      handlePreview();
    }
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      form.setFieldValue('signatureImage', signatureData);
      handlePreview();
    }
  };



  const handleDownloadWord = async () => {
    try {
      // Validate form first
      await form.validateFields();
      
      if (linkPreview === "/preview/template.docx") {
        // Fetch and download the original template file
        const response = await fetch(linkPreview);
        const blob = await response.blob();
        downloadBlob(blob, 'template.docx');
      } else {
        // Fetch and download the preview blob
        const response = await fetch(linkPreview);
        const blob = await response.blob();
        downloadBlob(blob, 'invoice.docx');
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      // Validate form first
      await form.validateFields();
      
      // Fetch the current preview blob
      const response = await fetch(linkPreview);
      const blob = await response.blob();
      
      // Convert blob to File
      const file = new File([blob], 'invoice.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Convert to PDF using the hook
      const pdfResponse = await convertToPdf({ file });
      const pdfBlob = pdfResponse.data;
      
      // Download the PDF
      const pdfFilename = file.name.replace('.docx', '.pdf');
      downloadBlob(pdfBlob, pdfFilename);
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


  return (
    <div className='h-screen p-4'>
        {/* <Button type="primary" onClick={() => setLinkPreview("/preview/template.docx")}>Sample</Button> */}
      <Row gutter={16} style={{ height: 'calc(100vh - 2rem)' }}>
        <Col span={12} style={{ height: '100%', overflowY: 'auto' }}>
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
              <DatePicker style={{ width: '100%' }} />
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
            <Form.List name="s">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                      <AppFormItem
                        {...restField}
                        name={[name, 'description']}
                        label="Description"
                        required
                        rules={[{ required: true, message: 'Please input description!' }]}
                      >
                        <Input.TextArea rows={2} placeholder="Enter description" />
                      </AppFormItem>
                      <AppFormItem
                        {...restField}
                        name={[name, 'amount']}
                        label="Amount"
                        required
                        rules={[{ required: true, message: 'Please input amount!' }]}
                      >
                        <InputNumber 
                          placeholder="0.00"
                          style={{ width: '100%' }}
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </AppFormItem>
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(name)}
                      >
                        Remove
                      </Button>
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
              required
              rules={[{ required: true, message: 'Please input account number!' }]}
            >
              <Input placeholder="Enter account number" />
            </AppFormItem>
            <AppFormItem
              label="SWIFT code Bank"
              name="swiftCode"
              required
              rules={[{ required: true, message: 'Please input SWIFT code!' }]}
            >
              <Input placeholder="Enter SWIFT code" />
            </AppFormItem>
            <AppFormItem
              label="Address"
              name="bankAddress"
              required
              rules={[{ required: true, message: 'Please input address!' }]}
            >
              <Input placeholder="Enter address" />
            </AppFormItem>
          </Card>

          {/* Digital Signature */}
          <Card title="Digital Signature" style={{ marginBottom: '24px' }}>
            <AppFormItem
              label="Draw Your Signature"
              name="signatureImage"
            >
              <div >
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: 'signature-canvas',
                    style: { border: '1px dashed #ccc', width: '100%', maxWidth: '400px' }
                  }}
                />
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <Button  onClick={clearSignature}>Clear</Button>
                  <Button  type="primary" onClick={saveSignature}>Save Signature</Button>
                </div>
              </div>
            </AppFormItem>
          </Card>
        </AppForm>
        </Col>
        
        <Col span={12} style={{ height: '100%', overflow: 'hidden' }}>
          <Card  title='Document Preview' extra={<div className='space-x-2' >
            <Button icon={<FileWordOutlined />} type="primary" onClick={handleDownloadWord}>
              Word
            </Button>
            <Button loading={isPending} icon={<FilePdfOutlined />} type="primary" onClick={handleDownloadPdf}>Pdf</Button>
            <Button icon={<EyeOutlined />} type="primary" onClick={() => handlePreview()}>Preview</Button>
          </div>} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '6px', height: '90vh', overflow: 'auto' }}>
              <DocxViewer  filePath={linkPreview} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

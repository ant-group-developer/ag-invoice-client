import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Input, Row, Select } from 'antd';
import { DATE_FORMAT } from '../../../../../common/enums/common';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';

interface InvoiceInfoSectionProps {
    invoiceNumber: string;
    handleInvoiceDateChange: (date: any) => void;
    handleReloadInvoice: () => void;
    currencyOptions: {
        value: string;
        label: string;
        locale: string;
        symbol: string;
    }[];
}

export const InvoiceInfoSection = ({
    invoiceNumber,
    handleInvoiceDateChange,
    handleReloadInvoice,
    currencyOptions,
}: InvoiceInfoSectionProps) => {
    return (
        <Card size="small" title="Invoice Information" className="mb-4!">
            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <AppFormItem
                        label="Date"
                        name="invoiceDate"
                        required
                        rules={[
                            {
                                required: true,
                                message: 'Please select date!',
                            },
                        ]}
                    >
                        <DatePicker
                            format={DATE_FORMAT.DATE_ONLY}
                            style={{ width: '100%' }}
                            onChange={handleInvoiceDateChange}
                        />
                    </AppFormItem>
                </Col>
                <Col xs={24} md={8}>
                    <AppFormItem
                        label="Invoice No."
                        name="invoiceNumber"
                        rules={[
                            {
                                required: true,
                                message: 'Please input invoice number!',
                            },
                        ]}
                        required
                    >
                        <Input
                            readOnly
                            value={invoiceNumber}
                            placeholder="Invoice number will auto-generate"
                            suffix={
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={handleReloadInvoice}
                                    title="Random last 3 digits"
                                />
                            }
                        />
                    </AppFormItem>
                </Col>
                <Col xs={24} md={8}>
                    <AppFormItem
                        label="Currency"
                        name="currency"
                        rules={[
                            {
                                required: true,
                                message: 'Please input currency!',
                            },
                        ]}
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
    );
};

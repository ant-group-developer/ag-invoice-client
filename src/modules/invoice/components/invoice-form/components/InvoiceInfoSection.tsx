import {
    ExportOutlined,
    ImportOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Input, Row, Select } from 'antd';
import { DATE_FORMAT } from '../../../../../common/enums/common';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';
import type { CurrencyOption } from '../../../constants';

interface InvoiceInfoSectionProps {
    handleInvoiceDateChange: (date: any) => void;
    handleReloadInvoice: () => void;
    handleExportFormData: () => void;
    handleImportButtonClick: () => void;
    currencyOptions: CurrencyOption[];
}

export const InvoiceInfoSection = ({
    handleInvoiceDateChange,
    handleReloadInvoice,
    handleExportFormData,
    handleImportButtonClick,
    currencyOptions,
}: InvoiceInfoSectionProps) => {
    return (
        <Card
            size="small"
            title="Invoice Information"
            className="mb-4!"
            extra={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        size="small"
                        icon={<ExportOutlined />}
                        onClick={handleExportFormData}
                    >
                        Export Data
                    </Button>
                    <Button
                        size="small"
                        icon={<ImportOutlined />}
                        onClick={handleImportButtonClick}
                    >
                        Import Data
                    </Button>
                </div>
            }
        >
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
                            placeholder="Enter invoice number"
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
                            style={{ width: '100%' }}
                            optionLabelProp="label"
                        >
                            {currencyOptions.map((item) => (
                                <Select.Option
                                    key={item.value}
                                    value={item.value}
                                    label={`${item.value} (${item.symbol})`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">
                                            {item.value} ({item.symbol})
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            {item.name}
                                        </span>
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </AppFormItem>
                </Col>
            </Row>
        </Card>
    );
};

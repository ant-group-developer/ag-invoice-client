import { Card, Input, InputNumber, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';

export const BankInfoSection = () => {
    return (
        <Card
            size="small"
            title="Payment information"
            style={{ height: '100%' }}
        >
            <AppFormItem
                label="Account name"
                name="accountName"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input account name!',
                    },
                ]}
            >
                <Input placeholder="Enter account name" />
            </AppFormItem>
            <AppFormItem
                label="Bank name"
                name="bankName"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input bank name!',
                    },
                ]}
            >
                <Input placeholder="Enter bank name" />
            </AppFormItem>
            <AppFormItem
                label="Account number"
                name="accountNumber"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input account number!',
                    },
                ]}
            >
                <Input placeholder="Enter account number" />
            </AppFormItem>
            <AppFormItem
                label="SWIFT code"
                name="swiftCode"
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || getFieldValue('routingNumber')) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error(
                                    'Please enter SWIFT code or Routing number'
                                )
                            );
                        },
                    }),
                ]}
            >
                <Input placeholder="Enter SWIFT code" />
            </AppFormItem>
            <AppFormItem
                label="Routing number"
                name="routingNumber"
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || getFieldValue('swiftCode')) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error(
                                    'Please enter SWIFT code or Routing number'
                                )
                            );
                        },
                    }),
                ]}
            >
                <InputNumber
                    style={{
                        width: '100%',
                    }}
                    placeholder="Enter routing number"
                />
            </AppFormItem>
            <AppFormItem label="Account type" name="accountType">
                <Select
                    allowClear
                    options={[
                        {
                            label: 'Checking',
                            value: 'Checking',
                        },
                        {
                            label: 'Saving',
                            value: 'Saving',
                        },
                    ]}
                    placeholder="Enter account type"
                />
            </AppFormItem>
            <AppFormItem label="Address" name="bankAddress">
                <TextArea
                    autoSize={{
                        minRows: 1,
                        maxRows: 5,
                    }}
                    placeholder="Enter address"
                />
            </AppFormItem>
        </Card>
    );
};

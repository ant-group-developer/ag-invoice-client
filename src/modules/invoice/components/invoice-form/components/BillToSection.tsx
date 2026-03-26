import { Card, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';

export const BillToSection = () => {
    return (
        <Card size="small" title="Bill to">
            <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Name"
                name="billToName"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input name!',
                    },
                ]}
            >
                <Input placeholder="Enter name" />
            </AppFormItem>
            <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Company"
                name="billToCompany"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input company!',
                    },
                ]}
            >
                <Input placeholder="Enter company" />
            </AppFormItem>
            <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Tax ID"
                name="billToTaxId"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input tax ID!',
                    },
                ]}
            >
                <Input placeholder="Enter tax ID" />
            </AppFormItem>
            <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Address"
                name="billToAddress"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input address!',
                    },
                ]}
            >
                <TextArea
                    autoSize={{
                        minRows: 1,
                        maxRows: 5,
                    }}
                    placeholder="Enter address"
                />
            </AppFormItem>
            <AppFormItem wrapperCol={{ span: 24 }} label="PO" name="po">
                <Input placeholder="Enter PO" />
            </AppFormItem>
        </Card>
    );
};

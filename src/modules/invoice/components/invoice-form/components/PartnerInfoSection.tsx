import { Card, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';

export const PartnerInfoSection = () => {
    return (
        <Card
            size="small"
            title="Partner information"
            style={{ height: '100%' }}
        >
            <AppFormItem
                label="Name"
                wrapperCol={{ span: 24 }}
                name="partnerName"
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
                label="Address"
                wrapperCol={{ span: 24 }}
                name="partnerAddress"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input address!',
                    },
                ]}
            >
                <TextArea
                    placeholder="Enter address"
                    autoSize={{
                        minRows: 1,
                        maxRows: 5,
                    }}
                />
            </AppFormItem>
            <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Zip Code"
                name="partnerZipCode"
                required
                rules={[
                    {
                        required: true,
                        message: 'Please input zip code!',
                    },
                ]}
            >
                <Input placeholder="Enter zip code" />
            </AppFormItem>
            <AppFormItem
                wrapperCol={{ span: 24 }}
                label="Email"
                name="partnerEmail"
                rules={[
                    {
                        type: 'email',
                        message: 'Please enter a valid email!',
                    },
                ]}
            >
                <Input placeholder="Enter email" />
            </AppFormItem>
            <AppFormItem wrapperCol={{ span: 24 }} label="Tax ID" name="taxId">
                <Input placeholder="Enter tax ID" />
            </AppFormItem>
        </Card>
    );
};

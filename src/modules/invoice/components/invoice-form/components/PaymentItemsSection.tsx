import { PlusOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    Row,
} from 'antd';
import { Trash } from 'lucide-react';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';

export const PaymentItemsSection = () => {
    return (
        <Card size="small" title="Payment Details" className="mb-5!">
            <div className="rounded-md border border-zinc-200 p-2 sm:p-4">
                <Row
                    gutter={[8, 8]}
                    align="middle"
                    style={{
                        padding: '8px 0',
                        backgroundColor: '#fafafa',
                        margin: '0 0 12px',
                    }}
                >
                    <Col xs={12} sm={10} md={16}>
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                        >
                            Description
                        </span>
                    </Col>
                    <Col xs={8} sm={6} md={6}>
                        <span
                            style={{
                                fontWeight: 600,
                                textAlign: 'left',
                                display: 'block',
                                padding: '0 4px',
                                fontSize: '14px',
                            }}
                        >
                            Amount
                        </span>
                    </Col>
                    <Col xs={4} sm={8} md={2}>
                        <span
                            style={{
                                fontWeight: 600,
                                textAlign: 'center',
                                display: 'block',
                                fontSize: '14px',
                            }}
                        ></span>
                    </Col>
                </Row>

                <Form.List name="s">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key}>
                                    <Row gutter={[8, 8]} align="top">
                                        <Col xs={24} sm={10} md={16}>
                                            <AppFormItem
                                                {...restField}
                                                name={[name, 'description']}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Please input description!',
                                                    },
                                                ]}
                                                colon={false}
                                                labelCol={{
                                                    span: 0,
                                                }}
                                                wrapperCol={{
                                                    span: 24,
                                                }}
                                            >
                                                <Input.TextArea
                                                    autoSize={{
                                                        minRows: 1,
                                                        maxRows: 5,
                                                    }}
                                                    placeholder="Enter description"
                                                    style={{
                                                        width: '100%',
                                                        fontSize: '14px',
                                                    }}
                                                />
                                            </AppFormItem>
                                        </Col>
                                        <Col xs={20} sm={6} md={6}>
                                            <AppFormItem
                                                {...restField}
                                                name={[name, 'amount']}
                                                label=""
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Please input amount!',
                                                    },
                                                ]}
                                                colon={false}
                                                labelCol={{
                                                    span: 0,
                                                }}
                                                wrapperCol={{
                                                    span: 24,
                                                }}
                                            >
                                                <InputNumber
                                                    placeholder="0.00"
                                                    style={{
                                                        width: '100%',
                                                        fontSize: '14px',
                                                    }}
                                                    min={0}
                                                    precision={2}
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ','
                                                        )
                                                    }
                                                />
                                            </AppFormItem>
                                        </Col>
                                        <Col
                                            xs={4}
                                            sm={8}
                                            md={2}
                                            className="flex items-center"
                                        >
                                            <Button
                                                type="default"
                                                shape="default"
                                                danger
                                                icon={<Trash size={16} />}
                                                onClick={() => remove(name)}
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
                                    width: '100%',
                                }}
                            >
                                Add Item
                            </Button>
                        </>
                    )}
                </Form.List>
            </div>
        </Card>
    );
};

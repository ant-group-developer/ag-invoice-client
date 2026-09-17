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
    Select,
} from 'antd';
import { Trash } from 'lucide-react';
import { useMemo } from 'react';
import AppFormItem from '../../../../../components/UI/antd-form/form-Item';
import { CURRENCY_OPTIONS } from '../../../constants';

export const PaymentItemsSection = () => {
    const form = Form.useFormInstance();
    const items = Form.useWatch('s', form);

    const totalsByCurrency = useMemo(() => {
        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }

        const currencyTotalsMap = new Map<string, number>();

        items.forEach((item) => {
            if (!item) return;
            const currency =
                item.currency ||
                form?.getFieldValue('currency') ||
                'USD';
            const amount = Number(item.amount || 0);
            const currentSum = currencyTotalsMap.get(currency) || 0;
            currencyTotalsMap.set(currency, currentSum + amount);
        });

        return Array.from(currencyTotalsMap.entries()).map(
            ([currencyCode, sum]) => {
                const option = CURRENCY_OPTIONS.find(
                    (c) => c.value === currencyCode
                );
                const symbol = option?.symbol || currencyCode;
                const locale = option?.locale || 'en-US';
                const formattedAmount = sum.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                return {
                    currency: currencyCode,
                    symbol,
                    name: option?.name || currencyCode,
                    sum,
                    formattedAmount,
                };
            }
        );
    }, [items, form]);

    return (
        <Card size="small" title="Payment Details" className="mb-5!">
            <div className="rounded-md border border-zinc-200 p-2 sm:p-4">
                <Row
                    gutter={[8, 8]}
                    align="middle"
                    className="hidden sm:flex"
                    style={{
                        padding: '8px 0',
                        backgroundColor: '#fafafa',
                        margin: '0 0 12px',
                    }}
                >
                    <Col sm={9} md={11}>
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                        >
                            Description
                        </span>
                    </Col>
                    <Col sm={6} md={5}>
                        <span
                            style={{
                                fontWeight: 600,
                                textAlign: 'left',
                                display: 'block',
                                padding: '0 4px',
                                fontSize: '14px',
                            }}
                        >
                            Currency
                        </span>
                    </Col>
                    <Col sm={6} md={6}>
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
                    <Col sm={3} md={2}>
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
                                        <Col xs={24} sm={9} md={11}>
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
                                        <Col xs={12} sm={6} md={5}>
                                            <AppFormItem
                                                {...restField}
                                                name={[name, 'currency']}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Please select currency!',
                                                    },
                                                ]}
                                                initialValue="USD"
                                                colon={false}
                                                labelCol={{
                                                    span: 0,
                                                }}
                                                wrapperCol={{
                                                    span: 24,
                                                }}
                                            >
                                                <Select
                                                    placeholder="Currency"
                                                    style={{
                                                        width: '100%',
                                                        fontSize: '14px',
                                                    }}
                                                    optionLabelProp="label"
                                                >
                                                    {CURRENCY_OPTIONS.map(
                                                        (item) => (
                                                            <Select.Option
                                                                key={item.value}
                                                                value={
                                                                    item.value
                                                                }
                                                                label={`${item.value} (${item.symbol})`}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="font-medium">
                                                                        {
                                                                            item.value
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            item.symbol
                                                                        }
                                                                        )
                                                                    </span>
                                                                    <span className="text-zinc-400 text-xs">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </Select.Option>
                                                        )
                                                    )}
                                                </Select>
                                            </AppFormItem>
                                        </Col>
                                        <Col xs={9} sm={6} md={6}>
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
                                            xs={3}
                                            sm={3}
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
                                onClick={() => {
                                    const defaultCurrency =
                                        form?.getFieldValue('currency') ||
                                        'USD';
                                    add({
                                        description: '',
                                        currency: defaultCurrency,
                                        amount: 0,
                                    });
                                }}
                                block
                                icon={<PlusOutlined />}
                                style={{
                                    width: '100%',
                                }}
                            >
                                Add Item
                            </Button>

                            {totalsByCurrency.length > 0 && (
                                <div className="mt-4 rounded-md bg-zinc-50 p-3 border border-zinc-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-semibold text-zinc-700">
                                            Total by Currency:
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {totalsByCurrency.map((item) => (
                                                <div
                                                    key={item.currency}
                                                    className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-zinc-200 shadow-xs"
                                                >
                                                    <span className="text-xs font-semibold text-zinc-500">
                                                        {item.currency}:
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-bold text-blue-600">
                                                        {item.symbol}{' '}
                                                        {item.formattedAmount}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Form.List>
            </div>
        </Card>
    );
};


import { Form, type FormItemProps } from 'antd';
import type { ReactNode } from 'react';

type AppFormItemProps = {
    children: ReactNode;
} & FormItemProps;

function AppFormItem({
    children,
    className,
    label,
    required,
    ...props
}: AppFormItemProps) {
    const customLabel = label ? (
        <span className="font-bold">
            {label}
            {required && <span style={{ color: 'red' }}> *</span>}
        </span>
    ) : (
        label
    );

    return (
        <Form.Item
            {...props}
            className={className}
            label={customLabel}
            required={false}
            style={{ marginBottom: '12px' }}
        >
            {children}
        </Form.Item>
    );
}

export default AppFormItem;

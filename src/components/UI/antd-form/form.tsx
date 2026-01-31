import { Button, Form, type ButtonProps, type FormProps } from "antd";
import type { ReactNode } from "react";
import { FORM_LAYOUT, FORM_LAYOUT_VERTICAL } from "../../../common/constants/common";

export type AppFormProps = {
    children?: ReactNode;
    submitText?: ReactNode;
    showSubmit?: boolean;
    submitProps?: ButtonProps;
    submitRootClassName?: string;
} & Omit<FormProps, 'name'>;

function AppForm({
    children,
    submitText,
    showSubmit = true,
    submitProps,
    submitRootClassName,
    ...props
}: AppFormProps) {
    const formLayout =
        props.layout === 'vertical' ? FORM_LAYOUT_VERTICAL : FORM_LAYOUT;
    return (
        <Form {...formLayout} {...props}>
            {children}
            <div
                className={`text-right ${!showSubmit ? 'hidden' : ''} ${submitRootClassName || ''}`}
            >
                <Button type="primary" {...submitProps} htmlType="submit">
                    {submitText ?? 'Submit'}
                </Button>
            </div>
        </Form>
    );
}

export default AppForm;

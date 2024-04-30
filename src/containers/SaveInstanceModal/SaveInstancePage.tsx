import React from 'react';
import type { FormProps } from 'antd';
import { Form, Input } from 'antd';

interface SaveInstancePageProps {}

type FieldType = {
  scheduleName?: string;
  remember?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = values => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
  console.log('Failed:', errorInfo);
};

const SaveInstancePage: React.FC<SaveInstancePageProps> = props => {
  const {} = props;
  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item<FieldType>
        label="Schedule Name"
        name="scheduleName"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input />
      </Form.Item>
    </Form>
  );
};

export default SaveInstancePage;

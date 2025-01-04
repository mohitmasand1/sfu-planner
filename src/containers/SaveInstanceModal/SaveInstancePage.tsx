import React from 'react';
import { Form, Input } from 'antd';

interface SaveInstancePageProps {
  form: ReturnType<typeof Form.useForm>; // Form instance passed from parent
}

const SaveInstancePage: React.FC<SaveInstancePageProps> = ({ form }) => {
  return (
    <Form
      form={form[0]} // Connect the parent form instance
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      autoComplete="off"
    >
      <Form.Item
        label="Schedule Name"
        name="scheduleName"
        rules={[{ required: true, message: 'Please input the schedule name!' }]}
      >
        <Input />
      </Form.Item>
    </Form>
  );
};

export default SaveInstancePage;

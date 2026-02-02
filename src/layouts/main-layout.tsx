import ProLayout from "@ant-design/pro-layout";

import { useState } from "react";
import {  Outlet, useLocation } from "react-router-dom";
import { routes } from "../routes/layout-route";
import { Dropdown } from "antd";
import { LogOut } from "lucide-react";

export default function AppLayout() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            <ProLayout
                title={'ANT Invoice'}
                logo="logo.png"
                route={routes}
                location={location}
                siderWidth={250}
                layout="top"
                                headerRender={false}
                contentWidth="Fluid"
                fixSiderbar
                collapsed={collapsed}
                onCollapse={setCollapsed}
                contentStyle={{ padding: 0 }}
              avatarProps={{
              src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
              size: 'small',
              title: 'User',
              render: (_props, dom) => {
                return (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'logout',
                          icon: <LogOut size={16} />,
                          label: 'Logout',
                        },
                      ],
                    }}
                  >
                    {dom}
                  </Dropdown>
                );
              },
            }}
               
            >
                <Outlet />
            </ProLayout>

           
        </>
    );
}
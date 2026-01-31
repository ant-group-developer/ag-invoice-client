import axiosBase from "../../../apis/axios-base"

export const invoiceApis = {
    convertToPdf: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axiosBase.post('/convert/doc-to-pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        })
    }
}

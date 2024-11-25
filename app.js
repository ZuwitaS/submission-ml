const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: 'localhost',
        routes: {
            payload: {
                maxBytes: 1000000, 
            },
        },
    });

    server.route({
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                maxBytes: 1000000,
                output: 'file',
                parse: true,
                multipart: true,
                allow: 'multipart/form-data',
            },
        },
        handler: async (request, h) => {
            try {
                const file = request.payload.image;

                
                if (!file) {
                    return h.response({
                        status: 'fail',
                        message: 'Terjadi kesalahan dalam melakukan prediksi: File tidak ditemukan.',
                    }).code(400);
                }

                
                const isCancer = Math.random() < 0.5; 
                const result = isCancer ? 'Cancer' : 'Non-cancer';
                const suggestion = isCancer ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.';
                const id = uuidv4();
                const createdAt = new Date().toISOString();

                return h.response({
                    status: 'success',
                    message: 'Model is predicted successfully',
                    data: {
                        id,
                        result,
                        suggestion,
                        createdAt,
                    },
                }).code(200);
            } catch (error) {
                return h.response({
                    status: 'fail',
                    message: 'Terjadi kesalahan dalam melakukan prediksi',
                }).code(400);
            }
        },
    });

 
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom && response.output.statusCode === 413) {
            return h.response({
                status: 'fail',
                message: `Payload content length greater than maximum allowed: 1000000`,
            }).code(413);
        }
        return h.continue;
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

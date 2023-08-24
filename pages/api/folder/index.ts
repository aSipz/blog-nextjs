import nc from 'next-connect';
import middleware from '../../../middleware/all';
import onError from '../../../middleware/error';
import { folder } from '../../../db';
import { Request } from '../../../types';

const handler = nc({
    onError,
});

handler.use(middleware);

handler.post(async (req: Request, res) => {
    const newFolder = await folder.createFolder(req.db, {
        name: req.body.name,
        createdBy: req.user.id
    });

    res.send({ data: newFolder });
});

export default handler;
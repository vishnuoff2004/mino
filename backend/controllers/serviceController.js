const { Service } = require('../models');
const { serviceSchema } = require('../validators/validators');
const { Op } = require('sequelize');

exports.getAllServices = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Service.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      services: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.json({ service });
  } catch (error) {
    next(error);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const { error, value } = serviceSchema.validate(req.body, { allowUnknown: true, abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, price, duration } = value;
    const service = await Service.create({ name, description, price, duration });
    res.status(201).json({ message: 'Service created successfully.', service });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { error, value } = serviceSchema.validate(req.body, { allowUnknown: true, abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const { name, description, price, duration } = value;
    await service.update({ name, description, price, duration });
    res.json({ message: 'Service updated successfully.', service });
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    await service.destroy();
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

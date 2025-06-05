using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using QRScanLunaAPI.Models;

namespace QRScanLunaAPI.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TbExtendedPackage> TbExtendedPackages { get; set; }

    public virtual DbSet<TbImage> TbImages { get; set; }

    public virtual DbSet<TbLogin> TbLogins { get; set; }

    public virtual DbSet<TbPackage> TbPackages { get; set; }

    public virtual DbSet<TbProject> TbProjects { get; set; }

    public virtual DbSet<TbRole> TbRoles { get; set; }

    public virtual DbSet<TbUser> TbUsers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=lunafotosgallery.ddns.net,1433;Database=lunafotosgalleryQRCodeScan_db;User Id=admin;Password=Forefore123;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TbExtendedPackage>(entity =>
        {
            entity.ToTable("TB_ExtendedPackage");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("ID");
            entity.Property(e => e.ExtendedPackageName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.PackageId).HasColumnName("PackageID");
            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        modelBuilder.Entity<TbImage>(entity =>
        {
            entity.HasKey(e => e.ImageId);

            entity.ToTable("TB_Image");

            entity.Property(e => e.ImageId).HasColumnName("ImageID");
            entity.Property(e => e.ContentType)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ImageHash).IsUnicode(false);
            entity.Property(e => e.ImageName).IsUnicode(false);
            entity.Property(e => e.ImagePath).IsUnicode(false);
            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
            entity.Property(e => e.UploadDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<TbLogin>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("TB_Login");

            entity.Property(e => e.Password).IsUnicode(false);
            entity.Property(e => e.Username).IsUnicode(false);
        });

        modelBuilder.Entity<TbPackage>(entity =>
        {
            entity.ToTable("TB_Package");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.PackageName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TbProject>(entity =>
        {
            entity.HasKey(e => e.ProjectId);

            entity.ToTable("TB_Project");

            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
            entity.Property(e => e.ProjectName).IsUnicode(false);
            entity.Property(e => e.ProjectPath).IsUnicode(false);
        });

        modelBuilder.Entity<TbRole>(entity =>
        {
            entity.ToTable("TB_Role");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TbUser>(entity =>
        {
            entity.ToTable("TB_User");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FacebookName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FacebookUrl)
                .IsUnicode(false)
                .HasColumnName("FacebookURL");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.InstagramName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.InstagramUrl)
                .IsUnicode(false)
                .HasColumnName("instagramURL");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.LineId)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("LineID");
            entity.Property(e => e.PackageId).HasColumnName("PackageID");
            entity.Property(e => e.Password).IsUnicode(false);
            entity.Property(e => e.Phone)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.PhotographerName)
                .HasMaxLength(250)
                .IsUnicode(false);
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
